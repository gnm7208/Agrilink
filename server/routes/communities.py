from flask import Blueprint, jsonify

bp = Blueprint("communities", __name__, url_prefix="/communities")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "communities service running"})
