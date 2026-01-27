from flask import Blueprint, jsonify

bp = Blueprint("messages", __name__, url_prefix="/messages")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "messages service running"})
