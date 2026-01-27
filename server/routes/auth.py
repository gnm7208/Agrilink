from flask import Blueprint, jsonify

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "auth service running"})
