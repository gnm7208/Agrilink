from datetime import timedelta

from flask import Blueprint, g, jsonify, request
from sqlalchemy.orm import joinedload

from extensions import db, limiter
from models import (
    AdminActionLog,
    Comment,
    Community,
    Like,
    Message,
    Post,
    Report,
    Role,
    User,
)
from rbac import admin_required
from services.account_service import hard_delete_user
from utils.timeutils import utcnow

bp = Blueprint("admin", __name__)

VALID_STATUSES = {"active", "suspended", "banned"}
VALID_ROLES = {"user", "expert", "admin"}
VALID_REPORT_STATUSES = {"pending", "resolved", "dismissed"}


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "admin service running"})


@bp.get("/stats")
@admin_required
def stats():
    """Platform overview: totals plus a daily new-user trend for the last 30 days."""
    since_30d = utcnow() - timedelta(days=30)
    since_7d = utcnow() - timedelta(days=7)

    total_users = User.query.count()
    total_posts = Post.query.count()
    total_communities = Community.query.count()
    total_messages = Message.query.count()
    total_likes = Like.query.count()
    total_comments = Comment.query.count()

    new_users_7d = User.query.filter(User.created_at >= since_7d).count()
    new_users_30d = User.query.filter(User.created_at >= since_30d).count()

    # UNION (not UNION ALL) already de-duplicates across both id sets.
    active_authors_7d = (
        db.session.query(Post.author_id)
        .filter(Post.created_at >= since_7d)
        .union(db.session.query(Comment.user_id).filter(Comment.created_at >= since_7d))
        .count()
    )

    # Zero-fill every day in the window (not just days with signups) so the
    # frontend bar chart shows a continuous 30-day trend rather than a
    # handful of disconnected bars.
    now = utcnow()
    new_users_by_day = []
    for i in range(29, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = User.query.filter(User.created_at >= day_start, User.created_at < day_end).count()
        new_users_by_day.append({"date": day_start.date().isoformat(), "count": count})

    return jsonify(
        {
            "total_users": total_users,
            "total_posts": total_posts,
            "total_communities": total_communities,
            "total_messages": total_messages,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "new_users_7d": new_users_7d,
            "new_users_30d": new_users_30d,
            "active_users_7d": active_authors_7d,
            "new_users_by_day": new_users_by_day,
            "pending_reports": Report.query.filter_by(status="pending").count(),
        }
    )


@bp.get("/users")
@admin_required
def list_users():
    """Paginated user list with search/role/status filters."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    search = request.args.get("search", "").strip()
    role = request.args.get("role", "").strip()
    status = request.args.get("status", "").strip()

    query = User.query
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "users": [u.to_dict(include_email=True) for u in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.get("/users/<int:user_id>")
@admin_required
def get_user(user_id):
    """User detail: profile, counts, and their most recent posts."""
    user = User.query.get_or_404(user_id)

    recent_posts = (
        Post.query.filter_by(author_id=user_id).order_by(Post.created_at.desc()).limit(10).all()
    )

    data = user.to_dict(include_email=True, include_stats=True)
    data["recent_posts"] = [p.to_dict(include_relations=False) for p in recent_posts]
    return jsonify(data)


@bp.patch("/users/<int:user_id>/status")
@admin_required
@limiter.limit("30 per minute")
def update_user_status(user_id):
    """Suspend, ban, or reactivate a user."""
    user = User.query.get_or_404(user_id)
    if user.id == g.current_user.id:
        return jsonify({"error": "You cannot change your own account status"}), 400

    data = request.get_json() or {}
    new_status = data.get("status", "").strip()
    reason = data.get("reason")

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400

    user.status = new_status
    AdminActionLog.record(
        admin_id=g.current_user.id,
        action=f"set_status_{new_status}",
        target_type="user",
        target_id=user.id,
        reason=reason,
    )
    db.session.commit()
    return jsonify(user.to_dict(include_email=True))


@bp.patch("/users/<int:user_id>/role")
@admin_required
@limiter.limit("30 per minute")
def update_user_role(user_id):
    """Promote or demote a user's role."""
    user = User.query.get_or_404(user_id)
    if user.id == g.current_user.id:
        return jsonify({"error": "You cannot change your own role"}), 400

    data = request.get_json() or {}
    new_role = data.get("role", "").strip()

    if new_role not in VALID_ROLES:
        return jsonify({"error": f"role must be one of {sorted(VALID_ROLES)}"}), 400

    role = Role.get_by_name(new_role)
    if role is None:
        return jsonify({"error": f"Role '{new_role}' is not configured"}), 400

    old_role = user.role
    user.set_role_by_name(new_role)
    AdminActionLog.record(
        admin_id=g.current_user.id,
        action="change_role",
        target_type="user",
        target_id=user.id,
        reason=f"{old_role} -> {new_role}",
    )
    db.session.commit()
    return jsonify(user.to_dict(include_email=True))


@bp.delete("/users/<int:user_id>")
@admin_required
@limiter.limit("30 per minute")
def delete_user(user_id):
    """Permanently delete a user account. Prefer suspend/ban for routine moderation."""
    user = User.query.get_or_404(user_id)
    if user.id == g.current_user.id:
        return jsonify({"error": "You cannot delete your own account"}), 400
    if user.is_admin():
        return jsonify({"error": "Cannot delete an admin account; demote first"}), 400

    reason = (request.get_json(silent=True) or {}).get("reason")
    AdminActionLog.record(
        admin_id=g.current_user.id,
        action="delete_user",
        target_type="user",
        target_id=user.id,
        reason=reason,
    )
    hard_delete_user(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})


@bp.get("/communities")
@admin_required
def list_communities():
    """Paginated community list with search, for moderation browsing."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    search = request.args.get("search", "").strip()

    query = Community.query.options(joinedload(Community.members))
    if search:
        query = query.filter(Community.name.ilike(f"%{search}%"))

    pagination = query.order_by(Community.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "communities": [c.to_dict() for c in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.get("/posts")
@admin_required
def list_posts():
    """Paginated platform-wide post list, for content moderation browsing."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    search = request.args.get("search", "").strip()

    query = Post.query.options(joinedload(Post.author), joinedload(Post.images))
    if search:
        query = query.filter(
            (Post.title.ilike(f"%{search}%")) | (Post.content.ilike(f"%{search}%"))
        )

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


@bp.delete("/posts/<int:post_id>")
@admin_required
@limiter.limit("30 per minute")
def delete_post_admin(post_id):
    """Admin override to remove a post regardless of authorship (e.g. policy violation)."""
    post = Post.query.get_or_404(post_id)
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
    return jsonify({"message": "Post deleted"})


@bp.delete("/comments/<int:comment_id>")
@admin_required
@limiter.limit("30 per minute")
def delete_comment_admin(comment_id):
    """Admin override to remove a comment regardless of authorship."""
    comment = Comment.query.get_or_404(comment_id)
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
    return jsonify({"message": "Comment deleted"})


@bp.get("/audit-log")
@admin_required
def audit_log():
    """Paginated moderation audit trail, newest first."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    admin_id = request.args.get("admin_id", type=int)
    action = request.args.get("action", "").strip()

    query = AdminActionLog.query.options(joinedload(AdminActionLog.admin))
    if admin_id:
        query = query.filter_by(admin_id=admin_id)
    if action:
        query = query.filter_by(action=action)

    pagination = query.order_by(AdminActionLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "entries": [e.to_dict() for e in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


def _report_target_preview(report):
    """Short preview of the reported content so admins aren't clicking in blind."""
    if report.target_type == "post":
        post = Post.query.get(report.target_id)
        if not post:
            return "[post deleted]"
        return post.title or post.content[:80]
    if report.target_type == "comment":
        comment = Comment.query.get(report.target_id)
        return comment.content[:80] if comment else "[comment deleted]"
    if report.target_type == "user":
        user = User.query.get(report.target_id)
        return f"@{user.username}" if user else "[user deleted]"
    return None


@bp.get("/reports")
@admin_required
def list_reports():
    """Paginated moderation queue, newest first. Defaults to pending only."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    status = request.args.get("status", "pending").strip()
    target_type = request.args.get("target_type", "").strip()

    query = Report.query.options(joinedload(Report.reporter))
    if status:
        query = query.filter(Report.status == status)
    if target_type:
        query = query.filter(Report.target_type == target_type)

    pagination = query.order_by(Report.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    def report_to_dict(r):
        d = r.to_dict()
        d["target_preview"] = _report_target_preview(r)
        return d

    return jsonify(
        {
            "reports": [report_to_dict(r) for r in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.patch("/reports/<int:report_id>")
@admin_required
@limiter.limit("30 per minute")
def update_report_status(report_id):
    """Resolve or dismiss a report. Deleting the underlying content is a separate call."""
    report = Report.query.get_or_404(report_id)
    data = request.get_json() or {}
    new_status = data.get("status", "").strip()

    if new_status not in {"resolved", "dismissed"}:
        return jsonify({"error": "status must be one of ['resolved', 'dismissed']"}), 400

    report.status = new_status
    report.resolved_at = utcnow()
    report.resolved_by = g.current_user.id
    AdminActionLog.record(
        admin_id=g.current_user.id,
        action="resolve_report" if new_status == "resolved" else "dismiss_report",
        target_type="report",
        target_id=report.id,
        reason=data.get("reason"),
    )
    db.session.commit()
    return jsonify(report.to_dict())
