"""
Tests for authentication endpoints.

Covers: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
"""
import pytest


class TestHealthCheck:
    """Test health check endpoint."""

    def test_auth_health(self, client):
        """Test auth service health check."""
        response = client.get("/api/auth/health")
        assert response.status_code == 200
        assert response.get_json()["status"] == "auth service running"


class TestRegister:
    """Test user registration endpoint."""

    def test_register_success(self, client, app, sample_user_data):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json=sample_user_data)

        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Registration successful"
        assert data["user"]["username"] == sample_user_data["username"]
        assert data["user"]["email"] == sample_user_data["email"]
        assert "password" not in data["user"]

    def test_register_missing_fields(self, client, app):
        """Test registration with missing required fields."""
        # Missing password
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com"
        })
        assert response.status_code == 400
        assert "Missing required fields" in response.get_json()["error"]

        # Missing email
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400

        # Missing username
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400

    def test_register_invalid_email(self, client, app):
        """Test registration with invalid email format."""
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "invalid-email",
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400
        assert "Invalid email" in response.get_json()["error"]

    def test_register_weak_password(self, client, app):
        """Test registration with weak password."""
        # Too short
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Short1!"
        })
        assert response.status_code == 400
        assert "Weak password" in response.get_json()["error"]

        # No uppercase
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepass123!@#"
        })
        assert response.status_code == 400

        # No special character
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass12345"
        })
        assert response.status_code == 400

    def test_register_invalid_username(self, client, app):
        """Test registration with invalid username."""
        # Too short
        response = client.post("/api/auth/register", json={
            "username": "ab",
            "email": "test@example.com",
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400
        assert "Invalid username" in response.get_json()["error"]

        # Invalid characters
        response = client.post("/api/auth/register", json={
            "username": "test user!",
            "email": "test@example.com",
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400

    def test_register_duplicate_email(self, client, app, sample_user_data):
        """Test registration with duplicate email."""
        # First registration
        client.post("/api/auth/register", json=sample_user_data)

        # Attempt duplicate
        response = client.post("/api/auth/register", json={
            "username": "differentuser",
            "email": sample_user_data["email"],
            "password": "DifferentPass123!@#"
        })
        assert response.status_code == 409
        assert "email already exists" in response.get_json()["message"]

    def test_register_duplicate_username(self, client, app, sample_user_data):
        """Test registration with duplicate username."""
        # First registration
        client.post("/api/auth/register", json=sample_user_data)

        # Attempt duplicate
        response = client.post("/api/auth/register", json={
            "username": sample_user_data["username"],
            "email": "different@example.com",
            "password": "DifferentPass123!@#"
        })
        assert response.status_code == 409
        assert "username is already taken" in response.get_json()["message"]


class TestLogin:
    """Test user login endpoint."""

    def test_login_success(self, client, create_user, sample_user_data):
        """Test successful login."""
        create_user(
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )

        response = client.post("/api/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Login successful"
        assert data["user"]["username"] == sample_user_data["username"]

    def test_login_missing_fields(self, client, app):
        """Test login with missing fields."""
        # Missing password
        response = client.post("/api/auth/login", json={
            "email": "test@example.com"
        })
        assert response.status_code == 400

        # Missing email
        response = client.post("/api/auth/login", json={
            "password": "SecurePass123!@#"
        })
        assert response.status_code == 400

    def test_login_wrong_email(self, client, create_user, sample_user_data):
        """Test login with non-existent email."""
        create_user(
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )

        response = client.post("/api/auth/login", json={
            "email": "wrong@example.com",
            "password": sample_user_data["password"]
        })

        assert response.status_code == 401
        # Should not reveal whether email exists
        assert "Invalid email or password" in response.get_json()["message"]

    def test_login_wrong_password(self, client, create_user, sample_user_data):
        """Test login with wrong password."""
        create_user(
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )

        response = client.post("/api/auth/login", json={
            "email": sample_user_data["email"],
            "password": "WrongPassword123!@#"
        })

        assert response.status_code == 401
        assert "Invalid email or password" in response.get_json()["message"]


class TestLogout:
    """Test user logout endpoint."""

    def test_logout_success(self, auth_client):
        """Test successful logout."""
        client, _ = auth_client

        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        assert response.get_json()["message"] == "Logout successful"

    def test_logout_clears_session(self, auth_client):
        """Test that logout clears the session."""
        client, _ = auth_client

        # Verify logged in
        response = client.get("/api/auth/me")
        assert response.get_json()["authenticated"] is True

        # Logout
        client.post("/api/auth/logout")

        # Verify logged out
        response = client.get("/api/auth/me")
        assert response.get_json()["authenticated"] is False


class TestMe:
    """Test current user endpoint."""

    def test_me_authenticated(self, auth_client):
        """Test /me endpoint when authenticated."""
        client, _ = auth_client

        response = client.get("/api/auth/me")
        assert response.status_code == 200

        data = response.get_json()
        assert data["authenticated"] is True
        assert data["user"]["username"] == "testuser"
        assert data["user"]["email"] == "test@example.com"

    def test_me_unauthenticated(self, client, app):
        """Test /me endpoint when not authenticated."""
        response = client.get("/api/auth/me")
        assert response.status_code == 200

        data = response.get_json()
        assert data["authenticated"] is False
        assert data["user"] is None
