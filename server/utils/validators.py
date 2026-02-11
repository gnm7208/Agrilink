"""
Utility functions for validation and sanitization.
"""
import re
from typing import Dict, Optional

import bleach


def validate_password(password: str) -> Dict[str, any]:
    """
    Validate password strength.

    Requirements:
    - Minimum 12 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Args:
        password: Password string to validate

    Returns:
        dict with 'valid' (bool) and 'errors' (list of str)
    """
    errors = []

    if len(password) < 12:
        errors.append("Password must be at least 12 characters long")

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', password):
        errors.append("Password must contain at least one special character (!@#$%^&*...)")

    # Check for common weak passwords
    common_passwords = [
        'password', 'password123', 'admin', 'admin123', 'letmein',
        'welcome', 'monkey', 'dragon', 'master', 'sunshine'
    ]
    if password.lower() in common_passwords:
        errors.append("Password is too common and easily guessed")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


def validate_email(email: str) -> Dict[str, any]:
    """
    Validate email format.

    Args:
        email: Email string to validate

    Returns:
        dict with 'valid' (bool) and 'error' (optional str)
    """
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not email:
        return {"valid": False, "error": "Email is required"}

    if len(email) > 120:
        return {"valid": False, "error": "Email is too long (max 120 characters)"}

    if not re.match(pattern, email):
        return {"valid": False, "error": "Invalid email format"}

    return {"valid": True}


def validate_username(username: str) -> Dict[str, any]:
    """
    Validate username format.

    Requirements:
    - 3-80 characters
    - Alphanumeric, underscores, and hyphens only
    - Must start with letter or number

    Args:
        username: Username string to validate

    Returns:
        dict with 'valid' (bool) and 'error' (optional str)
    """
    if not username:
        return {"valid": False, "error": "Username is required"}

    if len(username) < 3:
        return {"valid": False, "error": "Username must be at least 3 characters"}

    if len(username) > 80:
        return {"valid": False, "error": "Username must be at most 80 characters"}

    # Only alphanumeric, underscores, and hyphens
    if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9_-]*$', username):
        return {
            "valid": False,
            "error": "Username can only contain letters, numbers, underscores, and hyphens, and must start with a letter or number"
        }

    return {"valid": True}


def sanitize_text_input(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize text input by stripping whitespace and limiting length.

    Args:
        text: Text to sanitize
        max_length: Maximum allowed length (optional)

    Returns:
        Sanitized text string
    """
    if not text:
        return ""

    # Strip leading/trailing whitespace
    sanitized = text.strip()

    # Limit length if specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized


def sanitize_html_content(content: str) -> str:
    """
    Sanitize HTML content to prevent XSS attacks using `bleach`.

    Apply this to any rich-text content (e.g. post bodies, comments) before
    persisting it to the database.
    """
    if not content:
        return ""

    allowed_tags = [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "ul",
        "ol",
        "li",
        "p",
        "br",
        "span",
        "a",
    ]
    allowed_attributes = {
        "a": ["href", "title", "rel"],
        "span": ["class"],
        "*": ["class"],
    }

    cleaned = bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True,
    )
    return cleaned
