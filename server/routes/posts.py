from flask import Blueprint, jsonify, request, g
import os
import requests
import hashlib
from extensions import limiter, db
from models import Comment
from rbac import login_required

bp = Blueprint("posts", __name__)

DEFAULT_RATE_LIMIT = "30 per minute"
NEWS_QUERY = "agriculture OR farming OR crops OR livestock OR agribusiness"
NEWS_API_URL = "https://newsapi.org/v2/everything"


def make_article_id(article):
    """
    Stable ID based on article URL
    (same article will ALWAYS have the same ID)
    """
    return hashlib.md5(article["url"].encode()).hexdigest()


# --- Health check ---
@bp.get("/health")
def health():
    return jsonify({"status": "posts service running"}), 200


# --- Fetch agriculture articles ---
@bp.get("/news")
@limiter.limit(DEFAULT_RATE_LIMIT)
def fetch_news():
    api_key = os.environ.get("NEWSAPI_KEY")
    if not api_key:
        return jsonify({"error": "Missing NEWSAPI_KEY"}), 500

    page = request.args.get("page", 1, type=int)
    page_size = min(request.args.get("page_size", 20, type=int), 100)

    params = {
        "q": NEWS_QUERY,
        "language": "en",
        "sortBy": "publishedAt",
        "page": page,
        "pageSize": page_size,
        "apiKey": api_key
    }

    try:
        resp = requests.get(NEWS_API_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        raw_articles = data.get("articles", [])
        total_results = data.get("totalResults", 0)

        # Backend filtering + formatting
        articles = []
        for a in raw_articles:
            if not a.get("title") or not a.get("description"):
                continue

            articles.append({
                "id": make_article_id(a),
                "title": a["title"],
                "description": a["description"],
                "image": a.get("urlToImage"),
                "author": a.get("source", {}).get("name", "Unknown"),
                "publishedAt": a["publishedAt"],
                "url": a["url"]
            })

        has_more = page * page_size < total_results

        return jsonify({
            "articles": articles,
            "page": page,
            "pageSize": page_size,
            "totalResults": total_results,
            "hasMore": has_more
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "NewsAPI request failed",
            "details": str(e)
        }), 500


# --- Fetch single article ---
@bp.get("/news/<article_id>")
def get_single_news(article_id):
    api_key = os.environ.get("NEWSAPI_KEY")
    if not api_key:
        return jsonify({"error": "Missing NEWSAPI_KEY"}), 500

    params = {
        "q": NEWS_QUERY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 100,
        "page": 1,
        "apiKey": api_key
    }

    resp = requests.get(NEWS_API_URL, params=params, timeout=10)
    data = resp.json()

    for a in data.get("articles", []):
        if make_article_id(a) == article_id:
            return jsonify({
                "id": article_id,
                "title": a["title"],
                "description": a["description"],
                "image": a.get("urlToImage"),
                "author": a.get("source", {}).get("name"),
                "publishedAt": a["publishedAt"],
                "url": a["url"]
            }), 200

    return jsonify({"error": "Article not found"}), 404


# --- Comments ---
@bp.get("/news/<article_id>/comments")
@login_required
def get_comments(article_id):
    comments = Comment.query.filter_by(post_id=article_id)\
        .order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


@bp.post("/news/<article_id>/comments")
@login_required
def create_comment(article_id):
    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Content required"}), 400

    comment = Comment(
        post_id=article_id,
        author_id=g.current_user.id,
        content=content
    )

    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201
