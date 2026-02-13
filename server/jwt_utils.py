import jwt
from datetime import datetime, timedelta, timezone
from flask import current_app


def create_token(user_id):
    """Generate a JWT token for the given user ID."""
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=current_app.config["PERMANENT_SESSION_LIFETIME"]),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    """Decode and validate a JWT token. Returns the payload or None."""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
