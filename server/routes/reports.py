from flask import Blueprint, g, jsonify, request

from extensions import db, limiter
from models import Comment, Post, Report, User
from rbac import login_required

bp = Blueprint("reports", __name__)

DEFAULT_RATE_LIMIT = "30 per minute"
VALID_TARGET_TYPES = {"post", "comment", "user"}
VALID_REASONS = {"spam", "harassment", "misinformation", "inappropriate", "other"}


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "reports service running"})


def _get_target_owner_id(target_type, target_id):
    """Return the author/owner user id for a target, or None if it doesn't exist."""
    if target_type == "post":
        post = Post.query.get(target_id)
        return post.author_id if post else None
    if target_type == "comment":
        comment = Comment.query.get(target_id)
        return comment.user_id if comment else None
    if target_type == "user":
        user = User.query.get(target_id)
        return user.id if user else None
    return None


@bp.post("")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_report():
    """File a report against a post, comment, or user."""
    data = request.get_json() or {}
    target_type = data.get("target_type", "").strip()
    target_id = data.get("target_id")
    reason = data.get("reason", "").strip()
    details = data.get("details", "").strip() or None

    if target_type not in VALID_TARGET_TYPES:
        return jsonify({"error": f"target_type must be one of {sorted(VALID_TARGET_TYPES)}"}), 400
    if reason not in VALID_REASONS:
        return jsonify({"error": f"reason must be one of {sorted(VALID_REASONS)}"}), 400
    if not isinstance(target_id, int):
        return jsonify({"error": "target_id is required"}), 400

    owner_id = _get_target_owner_id(target_type, target_id)
    if owner_id is None:
        return jsonify({"error": "target not found"}), 404
    if owner_id == g.current_user.id:
        return jsonify({"error": "you cannot report your own content"}), 400

    existing = Report.query.filter_by(
        reporter_id=g.current_user.id, target_type=target_type, target_id=target_id
    ).first()
    if existing:
        return jsonify({"error": "you have already reported this"}), 400

    report = Report(
        reporter_id=g.current_user.id,
        target_type=target_type,
        target_id=target_id,
        reason=reason,
        details=details,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify(report.to_dict()), 201
