from flask import Blueprint, jsonify, request, session, g
from extensions import db
from models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "auth service running"})


@bp.post("/register")
def register():
    """Register a new user with username, email and password."""
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already in use"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already in use"}), 400

    user = User(
        username=username,
        email=email,
        role="user",
    )
    user.set_password(password)
    user.set_role_by_name("user")

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id

    return jsonify({"message": "registered", "user": user.to_dict(include_email=True)}), 201


@bp.post("/login")
def login():
    """Authenticate user and start session."""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    session["user_id"] = user.id

    return jsonify({"message": "logged in", "user": user.to_dict(include_email=True)})

@bp.post("/logout")
def logout():
    """End the current user session."""
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})

@bp.get("/me")
def me():
    if g.current_user is None:
        return jsonify({"user": None})
    return jsonify({"user": g.current_user.to_dict(include_email=True)})


