from flask import Blueprint, jsonify, request, g

from extensions import db
from models import Community, CommunityMembership, Post
from rbac import login_required, admin_required

bp = Blueprint("communities", __name__, url_prefix="/communities")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "communities service running"})


@bp.get("")
@login_required
def list_communities():
    communities = Community.query.order_by(Community.created_at.desc()).all()
    return jsonify([c.to_dict() for c in communities])


@bp.post("")
@login_required
def create_community():
    """Create a new community and add the creator as a member."""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description")
    image_url = data.get("image_url")

    if not name:
        return jsonify({"error": "name is required"}), 400

    community = Community(
        name=name,
        description=description,
        image_url=image_url,
        created_by=g.current_user.id,
    )
    db.session.add(community)
    db.session.commit()

    membership = CommunityMembership(user_id=g.current_user.id, community_id=community.id)
    db.session.add(membership)
    db.session.commit()

    return jsonify(community.to_dict()), 201


@bp.post("/<int:community_id>/join")
@login_required
def join_community(community_id):
    """Join an existing community as a member."""
    community = Community.query.get_or_404(community_id)
    existing = CommunityMembership.query.filter_by(
        user_id=g.current_user.id,
        community_id=community.id
    ).first()
    if existing:
        return jsonify({"error": "already a member"}), 400

    membership = CommunityMembership(user_id=g.current_user.id, community_id=community.id)
    db.session.add(membership)
    db.session.commit()
    return jsonify(membership.to_dict()), 201


@bp.get("/<int:community_id>/members")
@login_required
def community_members(community_id):
    Community.query.get_or_404(community_id)
    memberships = CommunityMembership.query.filter_by(community_id=community_id).all()
    return jsonify([m.to_dict() for m in memberships])


@bp.get("/<int:community_id>/posts")
@login_required
def community_posts(community_id):
    Community.query.get_or_404(community_id)
    posts = Post.query.filter_by(community_id=community_id).order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@bp.delete("/<int:community_id>")
@admin_required
def delete_community(community_id):
    community = Community.query.get_or_404(community_id)
    db.session.delete(community)
    db.session.commit()
    return jsonify({"message": "community deleted"})

