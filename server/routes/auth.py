from datetime import datetime
from flask import Blueprint, jsonify, request, session, g
from sqlalchemy.exc import IntegrityError
from extensions import db, limiter
from models import User
from rbac import login_required
from utils import validate_password, validate_email, validate_username

bp = Blueprint("auth", __name__, url_prefix="/auth")

# Rate limits for auth endpoints (Flask-Limiter)
DEFAULT_RATE_LIMIT = "15 per minute"
LOGIN_RATE_LIMIT = "5 per minute"  # Strict to prevent brute force
REGISTER_RATE_LIMIT = "3 per minute"  # Strict to prevent abuse


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "auth service running"})


@bp.post("/register")
@limiter.limit(REGISTER_RATE_LIMIT)
def register():
    """
    Register a new user with username, email and password.

    New users are assigned the 'user' role via set_role_by_name().

    Security features:
    - Rate limiting to prevent abuse
    - Strong password requirements (12+ chars, complexity)
    - Email and username validation
    - Duplicate checking with proper error messages
    """
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Validate required fields
    if not username or not email or not password:
        return jsonify({
            "error": "Missing required fields",
            "message": "username, email and password are required"
        }), 400

    # Validate username
    username_validation = validate_username(username)
    if not username_validation["valid"]:
        return jsonify({
            "error": "Invalid username",
            "message": username_validation["error"]
        }), 400

    # Validate email
    email_validation = validate_email(email)
    if not email_validation["valid"]:
        return jsonify({
            "error": "Invalid email",
            "message": email_validation["error"]
        }), 400

    # Validate password strength
    password_validation = validate_password(password)
    if not password_validation["valid"]:
        return jsonify({
            "error": "Weak password",
            "message": "Password does not meet security requirements",
            "requirements": password_validation["errors"]
        }), 400

    # Check for existing user
    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "Registration failed",
            "message": "An account with this email already exists"
        }), 409

    if User.query.filter_by(username=username).first():
        return jsonify({
            "error": "Registration failed",
            "message": "This username is already taken"
        }), 409

    try:
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        # Assign role via set_role_by_name() - roles table is source of truth
        user.set_role_by_name("user")

        db.session.add(user)
        db.session.commit()

        # Create session with timestamp
        session["user_id"] = user.id
        session["session_created_at"] = datetime.utcnow().isoformat()
        session.permanent = True  # Use PERMANENT_SESSION_LIFETIME from config

        return jsonify({
            "message": "Registration successful",
            "user": user.to_dict(include_email=True)
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            "error": "Registration failed",
            "message": "A database error occurred. Please try again."
        }), 500
    except Exception as e:
        db.session.rollback()
        # Log the error but don't expose details to user
        print(f"Registration error: {e}")
        return jsonify({
            "error": "Registration failed",
            "message": "An unexpected error occurred. Please try again."
        }), 500


@bp.post("/login")
@limiter.limit(LOGIN_RATE_LIMIT)
def login():
    """
    Authenticate user and start session.

    Security features:
    - Rate limiting to prevent brute force attacks
    - Generic error message (doesn't reveal if email exists)
    - Session timestamp for timeout enforcement
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Invalid request",
            "message": "Email and password are required"
        }), 400

    # Validate email format
    email_validation = validate_email(email)
    if not email_validation["valid"]:
        # Don't reveal specific validation error, use generic message
        return jsonify({
            "error": "Authentication failed",
            "message": "Invalid email or password"
        }), 401

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        # Generic error message - don't reveal if email exists
        return jsonify({
            "error": "Authentication failed",
            "message": "Invalid email or password"
        }), 401

    # Create session with timestamp
    session["user_id"] = user.id
    session["session_created_at"] = datetime.utcnow().isoformat()
    session.permanent = True  # Use PERMANENT_SESSION_LIFETIME from config

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(include_email=True)
    }), 200


@bp.post("/logout")
@limiter.limit(DEFAULT_RATE_LIMIT)
def logout():
    """
    End the current user session.

    Clears all session data for security.
    """
    session.clear()  # Clear all session data, not just user_id
    return jsonify({
        "message": "Logout successful"
    }), 200


@bp.get("/me")
@limiter.limit(DEFAULT_RATE_LIMIT)
def me():
    """
    Get current authenticated user profile.

    Returns user data if authenticated, null otherwise.
    """
    if g.current_user is None:
        return jsonify({
            "authenticated": False,
            "user": None
        }), 200

    return jsonify({
        "authenticated": True,
        "user": g.current_user.to_dict(include_email=True)
    }), 200

