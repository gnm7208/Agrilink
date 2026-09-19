from flask import Blueprint, current_app, g, jsonify, request, session
from sqlalchemy.exc import IntegrityError

from extensions import db, limiter
from jwt_utils import create_token
from models import PasswordResetToken, User
from rbac import login_required
from services.account_service import hard_delete_user
from services.email_service import send_verification_email
from utils import validate_email, validate_password, validate_username
from utils.email_verification import create_email_verification, verify_email_token
from utils.timeutils import utcnow

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
        return jsonify(
            {
                "error": "Missing required fields",
                "message": "username, email and password are required",
            }
        ), 400

    # Validate username
    username_validation = validate_username(username)
    if not username_validation["valid"]:
        return jsonify({"error": "Invalid username", "message": username_validation["error"]}), 400

    # Validate email
    email_validation = validate_email(email)
    if not email_validation["valid"]:
        return jsonify({"error": "Invalid email", "message": email_validation["error"]}), 400

    # Validate password strength
    password_validation = validate_password(password)
    if not password_validation["valid"]:
        return jsonify(
            {
                "error": "Weak password",
                "message": "Password does not meet security requirements",
                "requirements": password_validation["errors"],
            }
        ), 400

    # Check for existing user
    if User.query.filter_by(email=email).first():
        return jsonify(
            {"error": "Registration failed", "message": "An account with this email already exists"}
        ), 409

    if User.query.filter_by(username=username).first():
        return jsonify(
            {"error": "Registration failed", "message": "This username is already taken"}
        ), 409

    try:
        # Create new user (email_verified=False by default)
        user = User(username=username, email=email)
        user.set_password(password)
        # Assign role via set_role_by_name() - roles table is source of truth
        user.set_role_by_name("user")

        db.session.add(user)
        db.session.commit()

        # Create verification token and send email
        raw_token = create_email_verification(user)
        db.session.commit()
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        verification_link = f"{frontend_url.rstrip('/')}/verify-email?token={raw_token}"
        send_verification_email(user.email, verification_link)

        # Create session so user can resend from profile/login
        session["user_id"] = user.id
        session["session_created_at"] = utcnow().isoformat()
        session.permanent = True  # Use PERMANENT_SESSION_LIFETIME from config

        # In development when email is not configured, also return the
        # verification link in the response to help testing. In production
        # this link will not be returned to avoid exposing tokens.
        response_payload = {
            "message": "Registration successful. Please verify your email.",
            "email_verification_required": True,
            "user": user.to_dict(include_email=True),
        }
        if not current_app.config.get("MAIL_SERVER"):
            response_payload["verification_link"] = verification_link
        # Also include a JWT token on registration to help SPA stay authenticated
        try:
            response_payload["token"] = create_token(user.id)
        except Exception:
            pass

        return jsonify(response_payload), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify(
            {
                "error": "Registration failed",
                "message": "A database error occurred. Please try again.",
            }
        ), 500
    except Exception as e:
        db.session.rollback()
        # Log the error but don't expose details to user
        import traceback

        print(f"Registration error: {e}")
        traceback.print_exc()
        return jsonify(
            {
                "error": "Registration failed",
                "message": "An unexpected error occurred. Please try again.",
            }
        ), 500


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
        return jsonify(
            {"error": "Invalid request", "message": "Email and password are required"}
        ), 400

    # Validate email format
    email_validation = validate_email(email)
    if not email_validation["valid"]:
        # Don't reveal specific validation error, use generic message
        return jsonify(
            {"error": "Authentication failed", "message": "Invalid email or password"}
        ), 401

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        # Generic error message - don't reveal if email exists
        return jsonify(
            {"error": "Authentication failed", "message": "Invalid email or password"}
        ), 401

    if not user.is_active_status():
        return jsonify(
            {
                "error": "Account restricted",
                "message": f"This account has been {user.status} by an administrator.",
            }
        ), 403

    # Create session with timestamp
    session["user_id"] = user.id
    session["session_created_at"] = utcnow().isoformat()
    session.permanent = True  # Use PERMANENT_SESSION_LIFETIME from config

    payload = {"message": "Login successful", "user": user.to_dict(include_email=True)}
    if not user.email_verified:
        payload["email_not_verified"] = True
    # Also return a short-lived JWT token to support SPA auth across origins
    try:
        token = create_token(user.id)
        payload["token"] = token
    except Exception:
        # If token creation fails, do not break login — session will still be set
        pass
    return jsonify(payload), 200


@bp.post("/logout")
@limiter.limit(DEFAULT_RATE_LIMIT)
def logout():
    """
    End the current user session.

    Clears all session data for security.
    """
    session.clear()  # Clear all session data, not just user_id
    return jsonify({"message": "Logout successful"}), 200


@bp.delete("/me")
@login_required
@limiter.limit("5 per minute")
def delete_me():
    """
    Delete the current user's account and everything they posted.

    App stores require an in-app deletion path. The password is required again
    so an unlocked phone cannot wipe an account in one tap.
    """
    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""
    user = g.current_user

    if not password or not user.check_password(password):
        # 403, not 401: the session is valid, only the confirmation failed, and
        # the client treats a 401 as an expired session.
        return jsonify({"error": "Incorrect password"}), 403
    if user.is_admin():
        return jsonify(
            {"error": "Admin accounts are deleted from the admin console by another admin"}
        ), 403

    hard_delete_user(user)
    db.session.commit()
    session.clear()
    return jsonify({"message": "Account deleted"}), 200


@bp.get("/me")
@limiter.limit(DEFAULT_RATE_LIMIT)
def me():
    """
    Get current authenticated user profile.

    Returns user data if authenticated, null otherwise.
    """
    if g.current_user is None:
        return jsonify({"authenticated": False, "user": None}), 200

    return jsonify(
        {
            "authenticated": True,
            "user": g.current_user.to_dict(include_email=True, include_stats=True),
        }
    ), 200


@bp.post("/verify-email")
@limiter.limit("15 per minute")
def verify_email():
    """
    Verify email address using token from the verification link.

    Body: { "token": "..." }
    On success: sets user.email_verified=True, clears token fields.
    """
    data = request.get_json() or {}
    token = data.get("token", "").strip()

    if not token:
        return jsonify(
            {"error": "Invalid request", "message": "Invalid or expired verification link"}
        ), 400

    user = verify_email_token(token)
    if not user:
        return jsonify(
            {"error": "Invalid request", "message": "Invalid or expired verification link"}
        ), 400

    try:
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        db.session.commit()
        return jsonify({"message": "Email verified successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Verify email error: {e}")
        return jsonify(
            {
                "error": "Verification failed",
                "message": "An unexpected error occurred. Please try again.",
            }
        ), 500


@bp.post("/resend-verification")
@limiter.limit("5 per hour")
def resend_verification():
    """
    Resend verification email.

    Authenticated: use g.current_user.email.
    Unauthenticated: body { "email": "..." }.
    If already verified, return success (no enumeration).
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if g.current_user is not None:
        email = g.current_user.email

    if not email:
        return jsonify(
            {"error": "Missing required field", "message": "Email is required when not logged in"}
        ), 400

    email_validation = validate_email(email)
    if not email_validation["valid"]:
        return jsonify(
            {
                "message": "If an account exists with this email, a new verification link will be sent"
            }
        ), 200

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(
            {
                "message": "If an account exists with this email, a new verification link will be sent"
            }
        ), 200

    if user.email_verified:
        return jsonify(
            {
                "message": "If an account exists with this email, a new verification link will be sent"
            }
        ), 200

    try:
        raw_token = create_email_verification(user)
        db.session.commit()
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        verification_link = f"{frontend_url.rstrip('/')}/verify-email?token={raw_token}"
        send_verification_email(user.email, verification_link)
        return jsonify(
            {
                "message": "If an account exists with this email, a new verification link will be sent"
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        print(f"Resend verification error: {e}")
        return jsonify(
            {
                "message": "If an account exists with this email, a new verification link will be sent"
            }
        ), 200


@bp.post("/request-password-reset")
@limiter.limit("5 per hour")
def request_password_reset():
    """
    Request a password reset token for user email.

    Security features:
    - Rate limiting to prevent abuse (5 per hour)
    - Generic response (doesn't reveal if email exists) to prevent enumeration
    - Email validation before processing
    - Invalidates previous unused tokens

    Request body:
    {
        "email": "user@example.com"
    }

    Response:
    {
        "message": "If an account exists with this email, a password reset link will be sent"
    }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Missing required field", "message": "Email is required"}), 400

    # Validate email format
    email_validation = validate_email(email)
    if not email_validation["valid"]:
        # Return generic message for security (don't reveal if email exists)
        return jsonify(
            {"message": "If an account exists with this email, a password reset link will be sent"}
        ), 200

    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        # Return generic message for security (don't reveal if email exists)
        return jsonify(
            {"message": "If an account exists with this email, a password reset link will be sent"}
        ), 200

    try:
        # Create password reset token
        reset_token = PasswordResetToken.create_token(user.id)

        # TODO: Send email with reset link
        # The reset link should be: frontend_url/reset-password?token=<token>
        # For now, log the token for development purposes
        reset_link = f"http://localhost:5173/reset-password?token={reset_token.token}"
        print(f"Password reset link for {email}: {reset_link}")

        return jsonify(
            {"message": "If an account exists with this email, a password reset link will be sent"}
        ), 200

    except Exception as e:
        print(f"Password reset request error: {e}")
        return jsonify(
            {"message": "If an account exists with this email, a password reset link will be sent"}
        ), 200


@bp.get("/verify-reset-token/<token>")
@limiter.limit("30 per hour")
def verify_reset_token(token: str):
    """
    Verify if a password reset token is valid.

    This endpoint allows the frontend to check if a token is valid before
    showing the password reset form to the user.

    Response:
    {
        "valid": true,
        "message": "Token is valid"
    }
    or
    {
        "valid": false,
        "message": "Token is invalid or has expired"
    }
    """
    if not token or not isinstance(token, str) or len(token) < 10:
        return jsonify({"valid": False, "message": "Invalid token format"}), 400

    reset_token = PasswordResetToken.get_valid_token(token)
    if not reset_token:
        return jsonify({"valid": False, "message": "Token is invalid or has expired"}), 400

    return jsonify({"valid": True, "message": "Token is valid"}), 200


@bp.post("/reset-password")
@limiter.limit("5 per hour")
def reset_password():
    """
    Reset user password using a valid reset token.

    Security features:
    - Rate limiting to prevent abuse (5 per hour)
    - Token validation (not expired, not used)
    - Strong password requirements
    - Token marked as used after successful reset
    - Does not create session (user must login again)

    Request body:
    {
        "token": "reset-token-string",
        "password": "newpassword123"
    }

    Response:
    {
        "message": "Password reset successful. Please login with your new password."
    }
    """
    data = request.get_json() or {}
    token = data.get("token", "").strip()
    password = data.get("password", "")

    if not token or not password:
        return jsonify(
            {"error": "Missing required fields", "message": "Token and password are required"}
        ), 400

    # Validate password strength
    password_validation = validate_password(password)
    if not password_validation["valid"]:
        return jsonify(
            {
                "error": "Weak password",
                "message": "Password does not meet security requirements",
                "requirements": password_validation["errors"],
            }
        ), 400

    # Get valid token
    reset_token = PasswordResetToken.get_valid_token(token)
    if not reset_token:
        return jsonify(
            {
                "error": "Invalid token",
                "message": "The password reset link is invalid or has expired",
            }
        ), 400

    try:
        # Get the user associated with the token
        user = User.query.get(reset_token.user_id)
        if not user:
            return jsonify(
                {
                    "error": "Invalid token",
                    "message": "The password reset link is invalid or has expired",
                }
            ), 400

        # Update password
        user.set_password(password)
        # Mark token as used
        reset_token.mark_used()

        db.session.commit()

        return jsonify(
            {"message": "Password reset successful. Please login with your new password."}
        ), 200

    except Exception as e:
        db.session.rollback()
        print(f"Password reset error: {e}")
        return jsonify(
            {"error": "Reset failed", "message": "An unexpected error occurred. Please try again."}
        ), 500
