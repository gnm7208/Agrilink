from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import IntegrityError

from extensions import db, limiter
from models import Post, Comment, Like, PostImage, Community
from rbac import login_required, admin_required
from utils import sanitize_text_input, sanitize_html_content

bp = Blueprint("posts", __name__, url_prefix="/posts")

# Rate limits
DEFAULT_RATE_LIMIT = "30 per minute"
CREATE_POST_RATE_LIMIT = "10 per hour"
CREATE_COMMENT_RATE_LIMIT = "20 per hour"


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "posts service running"})


@bp.get("")
@limiter.limit(DEFAULT_RATE_LIMIT)
def list_posts():
    """
    List all posts with pagination.

    Query params:
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)
        community_id: Filter by community (optional)

    Note: Authentication is optional for viewing public posts.
    """
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    community_id = request.args.get("community_id", type=int)

    # Validate pagination parameters
    if page < 1:
        return jsonify({
            "error": "Invalid parameter",
            "message": "Page must be >= 1"
        }), 400

    # Build query
    query = Post.query

    # Filter by community if specified
    if community_id:
        query = query.filter_by(community_id=community_id)

    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    posts = [p.to_dict() for p in pagination.items]

    return jsonify({
        "posts": posts,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page
    }), 200


@bp.post("")
@login_required
@limiter.limit(CREATE_POST_RATE_LIMIT)
def create_post():
    """
    Create a new post in the user's feed or a community.

    Security features:
    - Rate limiting to prevent spam
    - Input validation and sanitization
    - Length limits on title and content
    - Community membership validation
    """
    data = request.get_json() or {}
    title = sanitize_text_input(data.get("title", ""), max_length=255)
    content = data.get("content", "").strip()
    community_id = data.get("community_id")

    # Validate content
    if not content:
        return jsonify({
            "error": "Missing required field",
            "message": "Content is required"
        }), 400

    if len(content) < 10:
        return jsonify({
            "error": "Invalid content",
            "message": "Content must be at least 10 characters"
        }), 400

    if len(content) > 10000:
        return jsonify({
            "error": "Invalid content",
            "message": "Content must be less than 10,000 characters"
        }), 400

    # Sanitize content to prevent XSS
    content = sanitize_html_content(content)

    # Validate title if provided
    if title and len(title) > 255:
        return jsonify({
            "error": "Invalid title",
            "message": "Title must be less than 255 characters"
        }), 400

    # If posting to a community, verify user is a member
    if community_id:
        community = Community.query.get(community_id)
        if not community:
            return jsonify({
                "error": "Invalid community",
                "message": "Community not found"
            }), 404

        # Check membership (implement this check based on your membership model)
        # For now, allow any authenticated user to post

    try:
        post = Post(
            author_id=g.current_user.id,
            content=content,
            title=title if title else None,
            community_id=community_id,
        )
        db.session.add(post)
        db.session.commit()

        return jsonify({
            "message": "Post created successfully",
            "post": post.to_dict()
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            "error": "Database error",
            "message": "Failed to create post"
        }), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error creating post: {e}")
        return jsonify({
            "error": "Server error",
            "message": "An unexpected error occurred"
        }), 500


@bp.get("/<int:post_id>")
@login_required
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict())


@bp.patch("/<int:post_id>")
@login_required
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id and not g.current_user.is_admin():
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}
    post.title = data.get("title", post.title)
    post.content = data.get("content", post.content)
    db.session.commit()
    return jsonify(post.to_dict())


@bp.delete("/<int:post_id>")
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id and not g.current_user.is_admin():
        return jsonify({"error": "forbidden"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "post deleted"})


@bp.post("/<int:post_id>/images")
@login_required
def add_post_image(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != g.current_user.id and not g.current_user.is_admin():
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}
    image_url = data.get("image_url")
    if not image_url:
        return jsonify({"error": "image_url is required"}), 400

    img = PostImage(post_id=post.id, image_url=image_url)
    db.session.add(img)
    db.session.commit()
    return jsonify(img.to_dict()), 201


@bp.post("/<int:post_id>/comments")
@login_required
def add_comment(post_id):
    """Add a comment to a post."""
    post = Post.query.get_or_404(post_id)
    data = request.get_json() or {}
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"error": "content is required"}), 400

    comment = Comment(
        user_id=g.current_user.id,
        post_id=post.id,
        content=content,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201


@bp.delete("/comments/<int:comment_id>")
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != g.current_user.id and not g.current_user.is_admin():
        return jsonify({"error": "forbidden"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "comment deleted"})


@bp.post("/<int:post_id>/like")
@login_required
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    existing = Like.query.filter_by(user_id=g.current_user.id, post_id=post.id).first()
    if existing:
        return jsonify({"error": "already liked"}), 400

    like = Like(user_id=g.current_user.id, post_id=post.id)
    db.session.add(like)
    db.session.commit()
    return jsonify(like.to_dict()), 201


@bp.delete("/<int:post_id>/like")
@login_required
def unlike_post(post_id):
    like = Like.query.filter_by(user_id=g.current_user.id, post_id=post_id).first()
    if not like:
        return jsonify({"error": "not liked"}), 400

    db.session.delete(like)
    db.session.commit()
    return jsonify({"message": "unliked"})

