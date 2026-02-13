from flask import Blueprint, jsonify, request, g
import os
import requests
import hashlib
import bleach
from sqlalchemy.orm import joinedload
from extensions import limiter, db
from models import Comment, Post, PostImage, Like, User
from rbac import login_required


def sanitize_content(text):
    """Strip all HTML tags from user-supplied text."""
    return bleach.clean(text, tags=[], strip=True)

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


# --- User posts CRUD ---
@bp.get("")
@limiter.limit(DEFAULT_RATE_LIMIT)
def list_posts():
    """List posts with optional author_id and community_id filters."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    author_id = request.args.get("author_id", type=int)
    community_id = request.args.get("community_id", type=int)

    query = Post.query.options(
        joinedload(Post.author),
        joinedload(Post.images),
        joinedload(Post.likes),
        joinedload(Post.comments),
    )
    if author_id is not None:
        query = query.filter_by(author_id=author_id)
    if community_id is not None:
        query = query.filter_by(community_id=community_id)

    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    def post_to_dict(p):
        d = p.to_dict(include_relations=True)
        d["author"] = p.author.to_dict() if p.author else None
        d["image_url"] = p.images[0].image_url if p.images else None
        return d

    return jsonify({
        "posts": [post_to_dict(p) for p in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page,
    })


@bp.post("")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_post():
    """Create a new post."""
    data = request.get_json() or {}
    content = sanitize_content(data.get("content", "")).strip()
    title = data.get("title", "").strip() or None
    community_id = data.get("community_id")
    image_url = data.get("image_url")

    if not content:
        return jsonify({"error": "Content is required"}), 400

    post = Post(
        author_id=g.current_user.id,
        title=title,
        content=content,
        community_id=community_id,
    )
    db.session.add(post)
    db.session.commit()

    if image_url:
        img = PostImage(post_id=post.id, image_url=image_url)
        db.session.add(img)
        db.session.commit()

    result = post.to_dict(include_relations=True)
    result["author"] = post.author.to_dict() if post.author else None
    result["image_url"] = image_url
    return jsonify({"post": result}), 201


@bp.get("/<int:post_id>")
@limiter.limit(DEFAULT_RATE_LIMIT)
def get_post(post_id):
    """Get a single post by ID."""
    post = Post.query.options(
        joinedload(Post.author),
        joinedload(Post.images),
        joinedload(Post.likes),
        joinedload(Post.comments),
    ).get_or_404(post_id)

    result = post.to_dict(include_relations=True)
    result["author"] = post.author.to_dict() if post.author else None
    result["image_url"] = post.images[0].image_url if post.images else None
    result["liked"] = bool(
        g.current_user and any(l.user_id == g.current_user.id for l in post.likes)
    )
    return jsonify(result)


@bp.patch("/<int:post_id>")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def update_post(post_id):
    """Update own post."""
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    if "title" in data:
        post.title = data["title"].strip() or None
    if "content" in data:
        content = data["content"].strip()
        if not content:
            return jsonify({"error": "Content cannot be empty"}), 400
        post.content = content
    if "community_id" in data:
        post.community_id = data["community_id"]

    db.session.commit()
    return jsonify(post.to_dict(include_relations=True))


@bp.delete("/<int:post_id>")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def delete_post(post_id):
    """Delete own post."""
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id:
        return jsonify({"error": "Forbidden"}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"}), 200


@bp.post("/<int:post_id>/like")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def like_post(post_id):
    """Like a post."""
    post = Post.query.get_or_404(post_id)
    existing = Like.query.filter_by(
        user_id=g.current_user.id, post_id=post_id
    ).first()
    if existing:
        return jsonify({
            "post_id": post_id,
            "liked": True,
            "likes_count": len(post.likes),
        }), 200

    like = Like(user_id=g.current_user.id, post_id=post_id)
    db.session.add(like)
    db.session.commit()
    post = Post.query.get_or_404(post_id)
    return jsonify({
        "post_id": post_id,
        "liked": True,
        "likes_count": len(post.likes),
    }), 200


@bp.delete("/<int:post_id>/like")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def unlike_post(post_id):
    """Unlike a post."""
    post = Post.query.get_or_404(post_id)
    like = Like.query.filter_by(
        user_id=g.current_user.id, post_id=post_id
    ).first()
    if like:
        db.session.delete(like)
        db.session.commit()
    post = Post.query.get_or_404(post_id)
    return jsonify({
        "post_id": post_id,
        "liked": False,
        "likes_count": len(post.likes),
    }), 200


@bp.get("/<int:post_id>/comments")
@limiter.limit(DEFAULT_RATE_LIMIT)
def get_post_comments(post_id):
    """List comments on a post with author info."""
    Post.query.get_or_404(post_id)
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    pagination = Comment.query.filter_by(post_id=post_id).options(
        joinedload(Comment.user)
    ).order_by(Comment.created_at.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    def comment_to_dict(c):
        d = c.to_dict()
        d["author"] = {
            "id": c.user.id,
            "username": c.user.username,
            "profile_image_url": c.user.profile_image_url,
        } if c.user else None
        return d

    return jsonify({
        "comments": [comment_to_dict(c) for c in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page,
    })


@bp.post("/<int:post_id>/comments")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_post_comment(post_id):
    """Add a comment to a post."""
    post = Post.query.get_or_404(post_id)
    data = request.get_json() or {}
    content = sanitize_content(data.get("content", "")).strip()

    if not content:
        return jsonify({"error": "Content is required"}), 400

    comment = Comment(
        post_id=post_id,
        user_id=g.current_user.id,
        content=content,
    )
    db.session.add(comment)
    db.session.commit()

    result = comment.to_dict()
    result["author"] = {
        "id": comment.user.id,
        "username": comment.user.username,
        "profile_image_url": comment.user.profile_image_url,
    }
    return jsonify(result), 201


@bp.post("/<int:post_id>/images")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def add_post_image(post_id):
    """Add an image to a post."""
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    image_url = data.get("image_url", "").strip()
    if not image_url:
        return jsonify({"error": "image_url is required"}), 400

    img = PostImage(post_id=post_id, image_url=image_url)
    db.session.add(img)
    db.session.commit()
    return jsonify(img.to_dict()), 201


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
