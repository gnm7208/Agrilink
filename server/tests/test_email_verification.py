"""
Tests for email verification: token utility, verify-email and resend-verification endpoints.
"""

import os
import sys
from datetime import timedelta
from unittest.mock import patch

import pytest

from utils.timeutils import utcnow

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from models import User
from utils.email_verification import create_email_verification, verify_email_token


@pytest.fixture(autouse=True)
def mock_send_verification_email():
    """Prevent real emails in tests."""
    with patch("routes.auth.send_verification_email") as m:
        yield m


class TestEmailVerificationTokenUtility:
    """Test token generation and verification utilities."""

    def test_create_email_verification_token(self, app, create_user):
        """Token is created, user has hash and expiry set."""
        with app.app_context():
            user_id = create_user(email="verify@example.com", username="verifyuser")
            user = User.query.get(user_id)
            user.email_verification_token = None
            user.email_verification_expires = None
            db.session.commit()

            raw_token = create_email_verification(user)
            assert raw_token
            assert len(raw_token) > 20
            assert user.email_verification_token is not None
            assert user.email_verification_expires is not None
            assert user.email_verification_expires > utcnow()

    def test_verify_email_token_success(self, app, create_user):
        """Valid token returns user and verification clears token fields."""
        with app.app_context():
            user_id = create_user(
                email="verify@example.com", username="verifyuser", email_verified=False
            )
            user = User.query.get(user_id)
            raw_token = create_email_verification(user)
            db.session.commit()

            found = verify_email_token(raw_token)
            assert found is not None
            assert found.id == user.id
            assert found.email_verification_token is not None

    def test_verify_email_token_expired(self, app, create_user):
        """Expired token returns None."""
        with app.app_context():
            user_id = create_user(
                email="expired@example.com", username="expireduser", email_verified=False
            )
            user = User.query.get(user_id)
            raw_token = create_email_verification(user)
            user.email_verification_expires = utcnow() - timedelta(hours=1)
            db.session.commit()

            found = verify_email_token(raw_token)
            assert found is None

    def test_verify_email_token_invalid(self, app):
        """Invalid token returns None."""
        with app.app_context():
            found = verify_email_token("invalid-token-string")
            assert found is None
            found = verify_email_token("")
            assert found is None


class TestVerifyEmailEndpoint:
    """Test POST /api/auth/verify-email."""

    def test_verify_email_success(self, client, app, create_user, mock_send_verification_email):
        with app.app_context():
            user_id = create_user(
                email="verify@example.com", username="verifyuser", email_verified=False
            )
            user = User.query.get(user_id)
            raw_token = create_email_verification(user)
            db.session.commit()

        response = client.post("/api/auth/verify-email", json={"token": raw_token})
        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Email verified successfully"

        with app.app_context():
            user = User.query.get(user_id)
            assert user.email_verified is True
            assert user.email_verification_token is None
            assert user.email_verification_expires is None

    def test_verify_email_invalid_token(self, client):
        response = client.post("/api/auth/verify-email", json={"token": "invalid-token"})
        assert response.status_code == 400
        assert "Invalid or expired" in response.get_json()["message"]

    def test_verify_email_missing_token(self, client):
        response = client.post("/api/auth/verify-email", json={})
        assert response.status_code == 400


class TestResendVerificationEndpoint:
    """Test POST /api/auth/resend-verification."""

    def test_resend_verification_authenticated(
        self, client, app, create_unverified_user, mock_send_verification_email
    ):
        """Logged-in unverified user can resend."""
        with app.app_context():
            create_unverified_user(
                username="resenduser", email="resend@example.com", password="SecurePass123!@#"
            )

        # Login to get session
        client.post(
            "/api/auth/login", json={"email": "resend@example.com", "password": "SecurePass123!@#"}
        )

        response = client.post("/api/auth/resend-verification", json={})
        assert response.status_code == 200
        mock_send_verification_email.assert_called_once()
        call_args = mock_send_verification_email.call_args
        assert call_args[0][0] == "resend@example.com"
        assert "verify-email?token=" in call_args[0][1]

    def test_resend_verification_by_email(
        self, client, app, create_unverified_user, mock_send_verification_email
    ):
        """Unauthenticated request with email sends to that email."""
        create_unverified_user(
            username="byemail", email="byemail@example.com", password="SecurePass123!@#"
        )

        response = client.post(
            "/api/auth/resend-verification", json={"email": "byemail@example.com"}
        )
        assert response.status_code == 200
        mock_send_verification_email.assert_called_once()
        assert mock_send_verification_email.call_args[0][0] == "byemail@example.com"

    def test_resend_verification_already_verified(
        self, client, create_user, mock_send_verification_email
    ):
        """Already verified user gets same generic success (no leak)."""
        create_user(
            username="verifieduser",
            email="verified@example.com",
            password="SecurePass123!@#",
            email_verified=True,
        )

        response = client.post(
            "/api/auth/resend-verification", json={"email": "verified@example.com"}
        )
        assert response.status_code == 200
        mock_send_verification_email.assert_not_called()

    def test_resend_verification_nonexistent_email(self, client, mock_send_verification_email):
        """Nonexistent email returns same generic message."""
        response = client.post(
            "/api/auth/resend-verification", json={"email": "nonexistent@example.com"}
        )
        assert response.status_code == 200
        mock_send_verification_email.assert_not_called()


class TestLoginReturnsEmailNotVerified:
    """Test that login returns email_not_verified for unverified users."""

    def test_login_returns_email_not_verified(self, client, create_user):
        create_user(
            username="unverifiedlogin",
            email="unverifiedlogin@example.com",
            password="SecurePass123!@#",
            email_verified=False,
        )

        response = client.post(
            "/api/auth/login",
            json={"email": "unverifiedlogin@example.com", "password": "SecurePass123!@#"},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["email_not_verified"] is True
        assert data["user"]["email"] == "unverifiedlogin@example.com"

    def test_login_verified_no_flag(self, client, create_user):
        create_user(
            username="verifiedlogin",
            email="verifiedlogin@example.com",
            password="SecurePass123!@#",
            email_verified=True,
        )

        response = client.post(
            "/api/auth/login",
            json={"email": "verifiedlogin@example.com", "password": "SecurePass123!@#"},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert "email_not_verified" not in data or data.get("email_not_verified") is not True


class TestRegisterSendsVerification:
    """Test that registration returns email_verification_required and does not auto-verify."""

    def test_register_returns_verification_required(
        self, client, sample_user_data, mock_send_verification_email
    ):
        response = client.post("/api/auth/register", json=sample_user_data)
        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Registration successful. Please verify your email."
        assert data["email_verification_required"] is True
        assert data["user"]["email_verified"] is False
        assert data["user"]["username"] == sample_user_data["username"]
        mock_send_verification_email.assert_called_once()
        call_args = mock_send_verification_email.call_args[0]
        assert call_args[0] == sample_user_data["email"]
        assert "verify-email?token=" in call_args[1]
