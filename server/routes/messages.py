from flask import Blueprint, jsonify, request, g

from extensions import db
from models import Message, Community, User
from rbac import login_required

bp = Blueprint("messages", __name__, url_prefix="/messages")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "messages service running"})


@bp.post("")
@login_required
def send_message():
    """Send a message to a user or community."""
    data = request.get_json() or {}
    content = data.get("content", "").strip()
    receiver_id = data.get("receiver_id")
    community_id = data.get("community_id")

    if not content:
        return jsonify({"error": "content is required"}), 400

    if not receiver_id and not community_id:
        return jsonify({"error": "receiver_id or community_id is required"}), 400

    if receiver_id and community_id:
        return jsonify({"error": "provide either receiver_id or community_id, not both"}), 400

    if receiver_id:
        User.query.get_or_404(receiver_id)

    if community_id:
        Community.query.get_or_404(community_id)

    msg = Message(
        sender_id=g.current_user.id,
        receiver_id=receiver_id,
        community_id=community_id,
        content=content,
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201


@bp.delete("/<int:message_id>")
@login_required
def delete_message(message_id):
    """Delete a message. Only the sender can delete their own messages."""
    message = Message.query.get_or_404(message_id)
    if message.sender_id != g.current_user.id:
        return jsonify({"error": "forbidden"}), 403
    
    db.session.delete(message)
    db.session.commit()
    return jsonify({"message": "message deleted"})


@bp.get("/user/<int:user_id>")
@login_required
def conversation_with_user(user_id):
    """Get all messages exchanged with a specific user with pagination.
    
    Query params:
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)
    """
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    
    User.query.get_or_404(user_id)
    pagination = Message.query.filter(
        ((Message.sender_id == g.current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == g.current_user.id))
    ).order_by(Message.created_at.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    messages = [m.to_dict() for m in pagination.items]
    
    return jsonify({
        "messages": messages,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page
    })


@bp.get("/community/<int:community_id>")
@login_required
def community_messages(community_id):
    """Get all messages in a community channel with pagination.
    
    Query params:
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)
    """
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    
    Community.query.get_or_404(community_id)
    pagination = Message.query.filter_by(community_id=community_id) \
        .order_by(Message.created_at.asc()) \
        .paginate(page=page, per_page=per_page, error_out=False)
    
    messages = [m.to_dict() for m in pagination.items]
    
    return jsonify({
        "messages": messages,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page
    })

