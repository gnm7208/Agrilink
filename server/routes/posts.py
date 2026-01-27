from flask import Blueprint, jsonify

bp = Blueprint("posts", __name__, url_prefix="/posts")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "posts service running"})
