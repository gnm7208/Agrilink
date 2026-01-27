from flask import Blueprint, jsonify

bp = Blueprint("users", __name__, url_prefix="/users")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "users service running"})
