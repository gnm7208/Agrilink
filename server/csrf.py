"""
Lightweight CSRF protection utilities for the AgriLink backend.

This module implements a double-submit token mechanism tied to the Flask
session. The frontend must send the token in the ``X-CSRF-Token`` header for
all state-changing requests (POST, PUT, PATCH, DELETE).
"""

import secrets

from flask import current_app, jsonify, request, session

CSRF_SESSION_KEY = "csrf_token"

SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


def get_or_set_csrf_token() -> str:
    """
    Return the current CSRF token for this session, creating one if needed.
    """
    token = session.get(CSRF_SESSION_KEY)
    if not token:
        token = secrets.token_hex(32)
        session[CSRF_SESSION_KEY] = token
    return token


def validate_csrf() -> tuple | None:
    """
    Validate CSRF token for unsafe HTTP methods.

    Returns a (response, status_code) tuple if validation fails, otherwise
    None to indicate that the request is allowed to proceed.
    """
    # Skip CSRF checks in testing to keep tests simple.
    if current_app.config.get("TESTING"):
        return None

    # Only enforce for API routes and unsafe methods.
    if request.method in SAFE_METHODS:
        return None

    if not request.path.startswith("/api/"):
        return None

    # Exempt auth entry points that run before a session/CSRF token exists.
    # Login and register do not have an established session yet, so requiring
    # X-CSRF-Token would force a prior GET to /api/auth/csrf-token and a race
    # with the frontend; exempting these is standard practice.
    if request.path in (
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/request-password-reset",
        "/api/auth/reset-password",
        "/api/auth/verify-email",
        "/api/auth/resend-verification",
    ):
        return None

    session_token = session.get(CSRF_SESSION_KEY)
    header_token = request.headers.get("X-CSRF-Token")
    # #region agent log
    try:
        import json

        with open("/home/user/AGRILINK/Agrilink/.cursor/debug.log", "a") as f:
            f.write(
                json.dumps(
                    {
                        "hypothesisId": "H1_H2_H3",
                        "location": "csrf.py:validate_csrf",
                        "message": "CSRF check",
                        "data": {
                            "path": request.path,
                            "method": request.method,
                            "session_has_token": bool(session_token),
                            "header_has_token": bool(header_token),
                            "tokens_match": session_token == header_token
                            if (session_token and header_token)
                            else False,
                        },
                        "timestamp": __import__("time").time() * 1000,
                    }
                )
                + "\n"
            )
    except Exception:
        pass
    # #endregion

    if not session_token or not header_token or session_token != header_token:
        # Do not leak implementation details.
        response = jsonify(
            {
                "error": "Forbidden",
                "message": "CSRF validation failed",
            }
        )
        return response, 403

    return None
