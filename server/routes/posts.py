import hashlib
import os
import time

import bleach
import requests
from flask import Blueprint, g, jsonify, request
from sqlalchemy.orm import joinedload

from extensions import db, limiter
from models import Comment, Like, Post, PostImage
from rbac import login_required


def sanitize_content(text):
    """Strip all HTML tags from user-supplied text."""
    return bleach.clean(text, tags=[], strip=True)


bp = Blueprint("posts", __name__)

DEFAULT_RATE_LIMIT = "30 per minute"

# Query sent to NewsAPI's /v2/everything endpoint. Kept narrower than a plain
# OR-of-words query, since that matches the words anywhere in the article
# body and pulls in unrelated results (wildlife trivia, geopolitics, etc.)
NEWS_QUERY = (
    '"agriculture" OR "farming" OR "agribusiness" OR "crop yield" '
    'OR "livestock farming" OR "agritech" OR "smallholder farmer"'
)

# Keywords an article's title/description must contain at least one of to be
# considered agriculture-relevant. Second line of defense against NewsAPI's
# loose full-text matching.
NEWS_RELEVANCE_KEYWORDS = (
    "agricult",
    "farm",
    "crop",
    "livestock",
    "harvest",
    "irrigation",
    "fertiliz",
    "fertilis",
    "soil",
    "drought",
    "agribusiness",
    "agritech",
    "plantation",
    "cattle",
    "poultry",
    "dairy",
    "rural econ",
)

# In-process TTL cache for NewsAPI responses. NewsAPI's free tier allows only
# 100 requests/day; without caching, that quota is exhausted after a handful
# of page loads and every user falls back to the static sample articles.
_NEWS_CACHE_TTL_SECONDS = 20 * 60
_news_cache = {}

# ISDA Africa API Configuration
ISDA_API_URL = os.environ.get("ISDA_API_URL", "https://api.isda-africa.com")
ISDA_USERNAME = os.environ.get("ISDA_USERNAME")
ISDA_PASSWORD = os.environ.get("ISDA_PASSWORD")

# NewsAPI.org Configuration (alternative news source)
NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY")


def _is_relevant_article(article):
    """Filter out removed/null articles and ones NewsAPI matched too loosely to be agriculture-related."""
    title = article.get("title")
    if not title or title == "[Removed]":
        return False
    description = (article.get("description") or "").lower()
    text = f"{title.lower()} {description}"
    return any(keyword in text for keyword in NEWS_RELEVANCE_KEYWORDS)


def make_article_id(article):
    """
    Stable ID based on article URL
    (same article will ALWAYS have the same ID)
    """
    url = article.get("url", article.get("link", ""))
    return hashlib.md5(url.encode()).hexdigest()


def get_isda_token():
    """Get ISDA API access token (with caching)."""
    import time

    token_cache = getattr(get_isda_token, "cache", None)
    if token_cache:
        token, expiry = token_cache
        if time.time() < expiry - 300:  # Refresh 5 minutes before expiry
            return token

    if not ISDA_USERNAME or not ISDA_PASSWORD:
        return None

    try:
        resp = requests.post(
            f"{ISDA_API_URL}/login",
            headers={
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=f"username={ISDA_USERNAME}&password={ISDA_PASSWORD}",
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        token = data.get("access_token")

        # Cache the token (assuming 1 hour expiry)
        import time

        get_isda_token.cache = (token, time.time() + 3600)

        return token
    except Exception as e:
        print(f"ISDA login failed: {e}")
        return None


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

    return jsonify(
        {
            "posts": [post_to_dict(p) for p in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.post("")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_post():
    """Create a new post."""
    data = request.get_json() or {}
    content = data.get("content", "").strip()
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
        g.current_user and any(like.user_id == g.current_user.id for like in post.likes)
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
    """Delete own post, or any post if the caller is an admin (moderation)."""
    post = Post.query.get_or_404(post_id)
    is_owner = post.author_id == g.current_user.id
    if not is_owner and not g.current_user.is_admin():
        return jsonify({"error": "Forbidden"}), 403

    if not is_owner:
        from models import AdminActionLog

        reason = (request.get_json(silent=True) or {}).get("reason")
        AdminActionLog.record(
            admin_id=g.current_user.id,
            action="delete_post",
            target_type="post",
            target_id=post.id,
            reason=reason,
        )

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"}), 200


@bp.post("/<int:post_id>/like")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def like_post(post_id):
    """Like a post."""
    post = Post.query.get_or_404(post_id)
    existing = Like.query.filter_by(user_id=g.current_user.id, post_id=post_id).first()
    if existing:
        return jsonify(
            {
                "post_id": post_id,
                "liked": True,
                "likes_count": len(post.likes),
            }
        ), 200

    like = Like(user_id=g.current_user.id, post_id=post_id)
    db.session.add(like)
    db.session.commit()
    post = Post.query.get_or_404(post_id)
    return jsonify(
        {
            "post_id": post_id,
            "liked": True,
            "likes_count": len(post.likes),
        }
    ), 200


@bp.delete("/<int:post_id>/like")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def unlike_post(post_id):
    """Unlike a post."""
    post = Post.query.get_or_404(post_id)
    like = Like.query.filter_by(user_id=g.current_user.id, post_id=post_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()
    post = Post.query.get_or_404(post_id)
    return jsonify(
        {
            "post_id": post_id,
            "liked": False,
            "likes_count": len(post.likes),
        }
    ), 200


@bp.get("/<int:post_id>/comments")
@limiter.limit(DEFAULT_RATE_LIMIT)
def get_post_comments(post_id):
    """List comments on a post with author info."""
    Post.query.get_or_404(post_id)
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    pagination = (
        Comment.query.filter_by(post_id=post_id)
        .options(joinedload(Comment.user))
        .order_by(Comment.created_at.asc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    def comment_to_dict(c):
        d = c.to_dict()
        d["author"] = (
            {
                "id": c.user.id,
                "username": c.user.username,
                "profile_image_url": c.user.profile_image_url,
            }
            if c.user
            else None
        )
        return d

    return jsonify(
        {
            "comments": [comment_to_dict(c) for c in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.post("/<int:post_id>/comments")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_post_comment(post_id):
    """Add a comment to a post."""
    Post.query.get_or_404(post_id)
    data = request.get_json() or {}
    content = data.get("content", "").strip()
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


@bp.delete("/comments/<int:comment_id>")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def delete_comment(comment_id):
    """Delete own comment, or any comment if the caller is an admin (moderation)."""
    comment = Comment.query.get_or_404(comment_id)
    is_owner = comment.user_id == g.current_user.id
    if not is_owner and not g.current_user.is_admin():
        return jsonify({"error": "Forbidden"}), 403

    if not is_owner:
        from models import AdminActionLog

        reason = (request.get_json(silent=True) or {}).get("reason")
        AdminActionLog.record(
            admin_id=g.current_user.id,
            action="delete_comment",
            target_type="comment",
            target_id=comment.id,
            reason=reason,
        )

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200


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
    """Fetch agriculture articles from NewsAPI.org, ISDA Africa API, or fallback."""

    page = max(request.args.get("page", 1, type=int), 1)
    page_size = min(max(request.args.get("page_size", 10, type=int), 1), 20)

    # Try NewsAPI.org first (if configured)
    if NEWSAPI_KEY:
        cache_key = ("newsapi", page, page_size)
        cached = _news_cache.get(cache_key)
        if cached and time.time() - cached[0] < _NEWS_CACHE_TTL_SECONDS:
            return jsonify(cached[1])

        try:
            resp = requests.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": NEWS_QUERY,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "page": page,
                    "pageSize": page_size,
                    "apiKey": NEWSAPI_KEY,
                },
                timeout=10,
            )

            if resp.status_code == 200:
                data = resp.json()
                articles = [a for a in data.get("articles", []) if _is_relevant_article(a)]

                formatted_articles = []
                for a in articles:
                    formatted_articles.append(
                        {
                            "id": make_article_id(a),
                            "title": a.get("title", ""),
                            "description": a.get("description", ""),
                            "image": a.get("urlToImage"),
                            "author": a.get("source", {}).get("name", "NewsAPI"),
                            "publishedAt": a.get("publishedAt", ""),
                            "url": a.get("url", ""),
                        }
                    )

                total_results = data.get("totalResults", len(formatted_articles))
                payload = {
                    "articles": formatted_articles,
                    "page": page,
                    "pageSize": len(formatted_articles),
                    "totalResults": total_results,
                    "hasMore": page * page_size < total_results,
                    "source": "newsapi",
                }
                _news_cache[cache_key] = (time.time(), payload)
                return jsonify(payload)
        except Exception as e:
            import logging

            logging.getLogger(__name__).error(f"NewsAPI error: {e}")

    # Try ISDA API second
    token = get_isda_token()

    if token:
        try:
            # Try to get articles from ISDA API
            # Note: Adjust the endpoint based on actual ISDA API structure
            resp = requests.get(
                f"{ISDA_API_URL}/articles",
                headers={"Accept": "application/json", "Authorization": f"Bearer {token}"},
                params={"category": "agriculture", "limit": 5},
                timeout=10,
            )

            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", data.get("data", []))

                formatted_articles = []
                for a in articles:
                    formatted_articles.append(
                        {
                            "id": make_article_id(a),
                            "title": a.get("title", a.get("headline", "")),
                            "description": a.get("description", a.get("summary", "")),
                            "image": a.get("image", a.get("image_url")),
                            "author": a.get("author", a.get("source", "ISDA Africa")),
                            "publishedAt": a.get("published_at", a.get("date", "")),
                            "url": a.get("url", a.get("link", "")),
                        }
                    )

                return jsonify(
                    {
                        "articles": formatted_articles,
                        "page": 1,
                        "pageSize": len(formatted_articles),
                        "totalResults": len(formatted_articles),
                        "hasMore": False,
                        "source": "isda-africa",
                    }
                )
            else:
                import logging

                logging.getLogger(__name__).warning(
                    f"ISDA API returned {resp.status_code}: {resp.text[:200]}"
                )
        except Exception as e:
            import logging

            logging.getLogger(__name__).error(f"ISDA API error: {e}")
            print(f"ISDA API request failed: {e}")

    # Fallback: sample articles when ISDA not available
    sample = [
        {
            "id": make_article_id({"url": "https://example.com/agriculture-1"}),
            "title": "Sustainable Farming Practices Gain Momentum in Africa",
            "description": "Farmers across the continent are adopting innovative sustainable practices to increase yields while protecting the environment.",
            "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800",
            "author": "AgriNews Africa",
            "publishedAt": "2026-02-14T08:00:00Z",
            "url": "https://example.com/agriculture-1",
        },
        {
            "id": make_article_id({"url": "https://example.com/agriculture-2"}),
            "title": "New Drought-Resistant Crop Varieties Released",
            "description": "Researchers announce breakthrough in developing crop varieties that can withstand harsh climate conditions.",
            "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
            "author": "Farm Weekly",
            "publishedAt": "2026-02-13T10:30:00Z",
            "url": "https://example.com/agriculture-2",
        },
        {
            "id": make_article_id({"url": "https://example.com/agriculture-3"}),
            "title": "Youth-Led AgriTech Startups Transforming Rural Farming",
            "description": "Young entrepreneurs are bringing technology to rural communities, revolutionizing how farmers access markets and information.",
            "image": "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800",
            "author": "Tech in Agriculture",
            "publishedAt": "2026-02-12T14:15:00Z",
            "url": "https://example.com/agriculture-3",
        },
        {
            "id": make_article_id({"url": "https://example.com/agriculture-4"}),
            "title": "Government Announces New Farm Subsidy Program",
            "description": "A new initiative aims to support smallholder farmers with direct subsidies and technical assistance.",
            "image": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800",
            "author": "Policy Watch",
            "publishedAt": "2026-02-11T09:00:00Z",
            "url": "https://example.com/agriculture-4",
        },
        {
            "id": make_article_id({"url": "https://example.com/agriculture-5"}),
            "title": "Organic Farming Certification Program Launches",
            "description": "New certification program helps farmers access premium markets for organic produce.",
            "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            "author": "Green Agriculture",
            "publishedAt": "2026-02-10T11:45:00Z",
            "url": "https://example.com/agriculture-5",
        },
    ]

    return jsonify(
        {
            "articles": sample,
            "page": 1,
            "pageSize": 5,
            "totalResults": 5,
            "hasMore": False,
            "source": "fallback",
        }
    )


# --- Fetch single article ---
@bp.get("/news/<article_id>")
def get_single_news(article_id):
    # Sample articles for fallback
    sample_articles = [
        {
            "url": "https://example.com/agriculture-1",
            "title": "Sustainable Farming Practices Gain Momentum in Africa",
            "description": "Farmers across the continent are adopting innovative sustainable practices to increase yields while protecting the environment.",
            "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800",
            "author": "AgriNews Africa",
            "publishedAt": "2026-02-14T08:00:00Z",
        },
        {
            "url": "https://example.com/agriculture-2",
            "title": "New Drought-Resistant Crop Varieties Released",
            "description": "Researchers announce breakthrough in developing crop varieties that can withstand harsh climate conditions.",
            "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
            "author": "Farm Weekly",
            "publishedAt": "2026-02-13T10:30:00Z",
        },
        {
            "url": "https://example.com/agriculture-3",
            "title": "Youth-Led AgriTech Startups Transforming Rural Farming",
            "description": "Young entrepreneurs are bringing technology to rural communities, revolutionizing how farmers access markets and information.",
            "image": "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800",
            "author": "Tech in Agriculture",
            "publishedAt": "2026-02-12T14:15:00Z",
        },
        {
            "url": "https://example.com/agriculture-4",
            "title": "Government Announces New Farm Subsidy Program",
            "description": "A new initiative aims to support smallholder farmers with direct subsidies and technical assistance.",
            "image": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800",
            "author": "Policy Watch",
            "publishedAt": "2026-02-11T09:00:00Z",
        },
        {
            "url": "https://example.com/agriculture-5",
            "title": "Organic Farming Certification Program Launches",
            "description": "New certification program helps farmers access premium markets for organic produce.",
            "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            "author": "Green Agriculture",
            "publishedAt": "2026-02-10T11:45:00Z",
        },
    ]

    # Try ISDA API first
    token = get_isda_token()

    if token:
        try:
            resp = requests.get(
                f"{ISDA_API_URL}/articles",
                headers={"Accept": "application/json", "Authorization": f"Bearer {token}"},
                params={"category": "agriculture", "limit": 5},
                timeout=10,
            )

            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", data.get("data", []))

                for a in articles:
                    if make_article_id(a) == article_id:
                        return jsonify(
                            {
                                "id": article_id,
                                "title": a.get("title", a.get("headline", "")),
                                "description": a.get("description", a.get("summary", "")),
                                "image": a.get("image", a.get("image_url")),
                                "author": a.get("author", a.get("source", "ISDA Africa")),
                                "publishedAt": a.get("published_at", a.get("date", "")),
                                "url": a.get("url", a.get("link", "")),
                            }
                        ), 200
        except Exception:
            pass

    # Fallback: check sample articles
    for article in sample_articles:
        if make_article_id(article) == article_id:
            return jsonify(
                {
                    "id": article_id,
                    "title": article["title"],
                    "description": article["description"],
                    "image": article["image"],
                    "author": article["author"],
                    "publishedAt": article["publishedAt"],
                    "url": article["url"],
                }
            ), 200

    return jsonify({"error": "Article not found"}), 404


# --- Comments ---
@bp.get("/news/<article_id>/comments")
@login_required
def get_comments(article_id):
    comments = Comment.query.filter_by(post_id=article_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


@bp.post("/news/<article_id>/comments")
@login_required
def create_comment(article_id):
    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Content required"}), 400

    comment = Comment(post_id=article_id, author_id=g.current_user.id, content=content)

    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201
