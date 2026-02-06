"""
Pytest configuration and fixtures for AgriLink API tests.
"""
import pytest

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models import User, Role, Community, CommunityMembership, Post, Comment, Like, Follow, Message


@pytest.fixture(scope="function")
def app():
    """Create application for testing with fresh database per test."""
    application = create_app(config_name="testing")

    with application.app_context():
        db.create_all()

        # Seed roles
        db.session.add(Role(id=1, name="user"))
        db.session.add(Role(id=2, name="admin"))
        db.session.commit()

    yield application

    # Cleanup after test
    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def sample_user_data():
    """Sample user registration data."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "SecurePass123!@#"
    }


@pytest.fixture
def sample_admin_data():
    """Sample admin registration data."""
    return {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "AdminPass123!@#"
    }


@pytest.fixture
def create_user(app):
    """Factory fixture to create a user."""
    def _create_user(username="testuser", email="test@example.com", password="SecurePass123!@#", role="user"):
        with app.app_context():
            user = User(username=username, email=email)
            user.set_password(password)
            user.set_role_by_name(role)
            db.session.add(user)
            db.session.commit()
            return user.id
    return _create_user


@pytest.fixture
def auth_client(app, client, create_user, sample_user_data):
    """Client with authenticated regular user session."""
    user_id = create_user(
        username=sample_user_data["username"],
        email=sample_user_data["email"],
        password=sample_user_data["password"]
    )

    # Login to establish session
    response = client.post("/api/auth/login", json={
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    })

    assert response.status_code == 200, f"Login failed: {response.get_json()}"
    return client, user_id


@pytest.fixture
def admin_client(app, client, create_user, sample_admin_data):
    """Client with authenticated admin user session."""
    user_id = create_user(
        username=sample_admin_data["username"],
        email=sample_admin_data["email"],
        password=sample_admin_data["password"],
        role="admin"
    )

    # Login to establish session
    response = client.post("/api/auth/login", json={
        "email": sample_admin_data["email"],
        "password": sample_admin_data["password"]
    })

    assert response.status_code == 200, f"Admin login failed: {response.get_json()}"
    return client, user_id


@pytest.fixture
def sample_community(auth_client):
    """Create a sample community."""
    client, user_id = auth_client

    response = client.post("/api/communities", json={
        "name": "Test Community",
        "description": "A test community"
    })

    assert response.status_code == 201, f"Community creation failed: {response.get_json()}"
    return response.get_json()


@pytest.fixture
def second_user(create_user):
    """Create a second user for interaction tests."""
    return create_user(
        username="seconduser",
        email="second@example.com",
        password="SecurePass123!@#"
    )
