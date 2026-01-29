from flask import Blueprint, jsonify, request, g

from extensions import db
from models import User, Follow
from rbac import admin_required, login_required

bp = Blueprint("users", __name__, url_prefix="/users")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "users service running"})


@bp.route("/admin/health", methods=["GET"])
@admin_required
def admin_health():
    return jsonify({"status": "admin endpoint running"})


@bp.get("")
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict(include_email=True) for u in users])


@bp.get("/<int:user_id>")
@login_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict(include_email=(g.current_user.is_admin() or g.current_user.id == user.id)))


@bp.patch("/<int:user_id>")
@login_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    if g.current_user.id != user.id and not g.current_user.is_admin():
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}
    user.bio = data.get("bio", user.bio)
    user.location = data.get("location", user.location)
    user.profile_image_url = data.get("profile_image_url", user.profile_image_url)

    db.session.commit()
    return jsonify(user.to_dict(include_email=(g.current_user.is_admin() or g.current_user.id == user.id)))


@bp.delete("/<int:user_id>")
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "user deleted"})


@bp.post("/<int:user_id>/follow")
@login_required
def follow_user(user_id):
    """Follow another user by their ID."""
    if g.current_user.id == user_id:
        return jsonify({"error": "cannot follow yourself"}), 400

    target = User.query.get_or_404(user_id)

    existing = Follow.query.filter_by(
        follower_id=g.current_user.id,
        followed_id=target.id
    ).first()
    if existing:
        return jsonify({"error": "already following"}), 400

    follow = Follow(follower_id=g.current_user.id, followed_id=target.id)
    db.session.add(follow)
    db.session.commit()
    return jsonify({"message": "followed", "follow": follow.to_dict()}), 201


@bp.delete("/<int:user_id>/follow")
@login_required
def unfollow_user(user_id):
    """Stop following a user by their ID."""
    follow = Follow.query.filter_by(
        follower_id=g.current_user.id,
        followed_id=user_id
    ).first()
    if not follow:
        return jsonify({"error": "not following"}), 400

    db.session.delete(follow)
    db.session.commit()
    return jsonify({"message": "unfollowed"})


@bp.get("/<int:user_id>/followers")
@login_required
def get_followers(user_id):
    followers = Follow.query.filter_by(followed_id=user_id).all()
    return jsonify([f.to_dict() for f in followers])


@bp.get("/<int:user_id>/following")
@login_required
def get_following(user_id):
    following = Follow.query.filter_by(follower_id=user_id).all()
    return jsonify([f.to_dict() for f in following])
