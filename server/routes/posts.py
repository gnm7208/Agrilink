from flask import Blueprint, jsonify, request, g
import os
import requests
import hashlib
from sqlalchemy.orm import joinedload
from extensions import limiter, db
from models import Comment, Post, PostImage, Like, User
from rbac import login_required
from utils import sanitize_html_content

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
        if d.get("image_url") is None and d.get("images"):
            first_img = d["images"][0] if d["images"] else None
            if first_img and isinstance(first_img, dict):
                d["image_url"] = first_img.get("image_url")
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
    content = data.get("content", "").strip()
    title = data.get("title", "").strip() or None
    community_id = data.get("community_id")
    image_url = data.get("image_url")
    image_urls = data.get("image_urls")

    # Normalize to list: prefer image_urls, fall back to single image_url
    urls_to_save = []
    if image_urls and isinstance(image_urls, list):
        urls_to_save = [u for u in image_urls if u and isinstance(u, str) and u.strip()]
    elif image_url and isinstance(image_url, str) and image_url.strip():
        urls_to_save = [image_url.strip()]

    if not content:
        return jsonify({"error": "Content is required"}), 400

    # Sanitize HTML content to prevent XSS
    content = sanitize_html_content(content)
    if title:
        title = sanitize_html_content(title)

    post = Post(
        author_id=g.current_user.id,
        title=title,
        content=content,
        community_id=community_id,
    )
    db.session.add(post)
    db.session.commit()

    for url in urls_to_save:
        img = PostImage(post_id=post.id, image_url=url)
        db.session.add(img)
    if urls_to_save:
        db.session.commit()
        db.session.refresh(post)

    result = post.to_dict(include_relations=True)
    result["author"] = post.author.to_dict() if post.author else None
    result["image_url"] = post.images[0].image_url if post.images else None
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
        title = data["title"].strip() or None
        if title:
            title = sanitize_html_content(title)
        post.title = title
    if "content" in data:
        content = data["content"].strip()
        if not content:
            return jsonify({"error": "Content cannot be empty"}), 400
        content = sanitize_html_content(content)
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
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Content is required"}), 400

    # Sanitize HTML content to prevent XSS
    content = sanitize_html_content(content)

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
    # #region agent log
    try:
        import json as _json
        with open("/home/user/AGRILINK/Agrilink/.cursor/debug.log", "a") as _f:
            _f.write(_json.dumps({"hypothesisId": "H4", "location": "posts.py:fetch_news", "message": "News API key check", "data": {"has_api_key": bool(api_key)}, "timestamp": __import__("time").time() * 1000}) + "\n")
    except Exception:
        pass
    # #endregion
    if not api_key:
        # Return 200 with empty articles so frontend does not break; avoid 500.
        return jsonify({
            "articles": [],
            "page": request.args.get("page", 1, type=int),
            "pageSize": min(request.args.get("page_size", 20, type=int), 100),
            "totalResults": 0,
            "hasMore": False,
        }), 200

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
        # #region agent log
        try:
            import json as _json
            with open("/home/user/AGRILINK/Agrilink/.cursor/debug.log", "a") as _f:
                _f.write(_json.dumps({"hypothesisId": "H5", "location": "posts.py:fetch_news", "message": "News RequestException", "data": {"error_type": type(e).__name__, "error_str": str(e)[:200]}, "timestamp": __import__("time").time() * 1000}) + "\n")
        except Exception:
            pass
        # #endregion
        return jsonify({
            "error": "NewsAPI request failed",
            "details": str(e)
        }), 500
    except Exception as e:
        # #region agent log
        try:
            import json as _json
            with open("/home/user/AGRILINK/Agrilink/.cursor/debug.log", "a") as _f:
                _f.write(_json.dumps({"hypothesisId": "H6", "location": "posts.py:fetch_news", "message": "News other exception", "data": {"error_type": type(e).__name__, "error_str": str(e)[:200]}, "timestamp": __import__("time").time() * 1000}) + "\n")
        except Exception:
            pass
        # #endregion
        raise


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


# --- Comments on News Articles ---
# Note: News articles are external content from NewsAPI and are not stored
# as Post records. Comments on news articles are not supported in the MVP
# to avoid schema confusion. Users can create regular posts to discuss
# news articles if needed.

@bp.get("/news/<article_id>/comments")
@login_required
def get_comments(article_id):
    """Comments on news articles are not supported."""
    return jsonify({
        "error": "Not supported",
        "message": "Comments on news articles are not available. You can create a post to discuss news articles."
    }), 501


@bp.post("/news/<article_id>/comments")
@login_required
def create_comment(article_id):
    """Comments on news articles are not supported."""
    return jsonify({
        "error": "Not supported",
        "message": "Comments on news articles are not available. You can create a post to discuss news articles."
    }), 501
