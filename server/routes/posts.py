
from flask import Blueprint, jsonify, request, g

from extensions import db
from models import Post, Comment, Like, PostImage
from rbac import login_required, admin_required

bp = Blueprint("posts", __name__, url_prefix="/posts")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "posts service running"})


@bp.get("")
@login_required
def list_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@bp.post("")
@login_required
def create_post():
    data = request.get_json() or {}
    content = data.get("content", "").strip()
    title = data.get("title")
    community_id = data.get("community_id")

    if not content:
        return jsonify({"error": "content is required"}), 400

    post = Post(
        author_id=g.current_user.id,
        content=content,
        title=title,
        community_id=community_id,
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


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

