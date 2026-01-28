from flask import Blueprint, jsonify

from rbac import admin_required

bp = Blueprint("users", __name__, url_prefix="/users")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "users service running"})


@bp.route("/admin/health", methods=["GET"])
@admin_required
def admin_health():
    return jsonify({"status": "admin endpoint running"})
