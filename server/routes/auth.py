from flask import Blueprint, request, session, jsonify
from extensions import db
from models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "auth service running"})




bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.post("/register")
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(username=username, email=email, role="user")
    user.set_password(password)
    user.set_role_by_name("user")

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})



@bp.post("/login")
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["user_id"] = user.id

    return jsonify({"message": "Logged in", "user": {"id": user.id, "username": user.username}})

@bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})

@bp.get("/me")
def me():
    if g.current_user:
        return jsonify({"id": g.current_user.id, "username": g.current_user.username})
    return jsonify({"user": None})


