"""
Email verification token generation and validation.

Tokens are stored as SHA256 hashes; the raw token is only sent in the verification link.
"""
import hashlib
import secrets
from datetime import datetime, timedelta

from flask import current_app
from extensions import db
from models import User


def generate_verification_token() -> str:
    """Generate a new URL-safe verification token."""
    return secrets.token_urlsafe(32)


def _hash_token(token: str) -> str:
    """Return SHA256 hex digest of the token."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_email_verification(user: User) -> str:
    """
    Create or overwrite email verification for the user.
    One active token per user; old token is replaced.

    Sets user.email_verification_token (hash) and user.email_verification_expires.
    Caller must commit the session after sending the email.

    Returns:
        Raw token string to use in the verification link.
    """
    raw_token = generate_verification_token()
    token_hash = _hash_token(raw_token)

    expiry_hours = 24
    if current_app:
        expiry_hours = current_app.config.get("EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS", 24)
    expires = datetime.utcnow() + timedelta(hours=expiry_hours)

    user.email_verification_token = token_hash
    user.email_verification_expires = expires
    return raw_token


def verify_email_token(token: str) -> User | None:
    """
    Validate token and return the user if valid and not expired.

    Args:
        token: Raw token from the verification link.

    Returns:
        User instance if token is valid and not expired, else None.
    """
    if not token or not token.strip():
        return None
    token_hash = _hash_token(token.strip())
    now = datetime.utcnow()
    user = User.query.filter_by(
        email_verification_token=token_hash,
    ).first()
    if not user or not user.email_verification_expires or user.email_verification_expires <= now:
        return None
    return user
