"""
Tests for user management endpoints.

Covers: /api/users endpoints (list, get, update, delete, follow/unfollow)
"""


class TestHealthCheck:
    """Test health check endpoint."""

    def test_users_health(self, client):
        """Test users service health check."""
        response = client.get("/api/users/health")
        assert response.status_code == 200
        assert response.get_json()["status"] == "users service running"


class TestListUsers:
    """Test list users endpoint (admin only)."""

    def test_list_users_as_admin(self, admin_client):
        """Test listing users as admin."""
        client, _ = admin_client

        response = client.get("/api/users")
        assert response.status_code == 200

        data = response.get_json()
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert data["page"] == 1

    def test_list_users_as_regular_user(self, auth_client):
        """Test that regular users cannot list all users."""
        client, _ = auth_client

        response = client.get("/api/users")
        assert response.status_code == 403

    def test_list_users_unauthenticated(self, client, app):
        """Test that unauthenticated users cannot list users."""
        response = client.get("/api/users")
        assert response.status_code == 401

    def test_list_users_pagination(self, admin_client, create_user):
        """Test user listing pagination."""
        client, _ = admin_client

        # Create additional users
        for i in range(5):
            create_user(
                username=f"extrauser{i}", email=f"extra{i}@example.com", password="SecurePass123!@#"
            )

        # Test pagination
        response = client.get("/api/users?page=1&per_page=3")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["users"]) <= 3
        assert data["per_page"] == 3


class TestGetUser:
    """Test get single user endpoint."""

    def test_get_user_success(self, auth_client, second_user):
        """Test getting a user's profile."""
        client, _ = auth_client

        response = client.get(f"/api/users/{second_user}")
        assert response.status_code == 200

        data = response.get_json()
        assert data["username"] == "seconduser"
        # Email should not be visible for other users
        assert "email" not in data or data.get("email") is None

    def test_get_own_profile_includes_email(self, auth_client):
        """Test that getting own profile includes email."""
        client, user_id = auth_client

        response = client.get(f"/api/users/{user_id}")
        assert response.status_code == 200

        data = response.get_json()
        assert "email" in data
        assert data["email"] == "test@example.com"

    def test_get_user_not_found(self, auth_client):
        """Test getting non-existent user."""
        client, _ = auth_client

        response = client.get("/api/users/99999")
        assert response.status_code == 404

    def test_get_user_unauthenticated(self, client, app, create_user):
        """Test that unauthenticated users cannot view profiles."""
        user_id = create_user()

        response = client.get(f"/api/users/{user_id}")
        assert response.status_code == 401


class TestUpdateUser:
    """Test update user endpoint."""

    def test_update_own_profile(self, auth_client):
        """Test updating own profile."""
        client, user_id = auth_client

        response = client.patch(
            f"/api/users/{user_id}", json={"bio": "Updated bio", "location": "New Location"}
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["bio"] == "Updated bio"
        assert data["location"] == "New Location"

    def test_update_other_user_forbidden(self, auth_client, second_user):
        """Test that users cannot update others' profiles."""
        client, _ = auth_client

        response = client.patch(f"/api/users/{second_user}", json={"bio": "Hacked bio"})

        assert response.status_code == 403

    def test_admin_can_update_any_user(self, admin_client, second_user):
        """Test that admin can update any user's profile."""
        client, _ = admin_client

        response = client.patch(f"/api/users/{second_user}", json={"bio": "Admin updated bio"})

        assert response.status_code == 200
        assert response.get_json()["bio"] == "Admin updated bio"

    def test_update_profile_image(self, auth_client):
        """Test updating profile image URL."""
        client, user_id = auth_client

        response = client.patch(
            f"/api/users/{user_id}", json={"profile_image_url": "https://example.com/image.jpg"}
        )

        assert response.status_code == 200
        assert response.get_json()["profile_image_url"] == "https://example.com/image.jpg"


class TestDeleteUser:
    """Test delete user endpoint (admin only)."""

    def test_admin_can_delete_user(self, admin_client, second_user):
        """Test that admin can delete users."""
        client, _ = admin_client

        response = client.delete(f"/api/users/{second_user}")
        assert response.status_code == 200
        assert response.get_json()["message"] == "user deleted"

        # Verify user is deleted
        response = client.get(f"/api/users/{second_user}")
        assert response.status_code == 404

    def test_regular_user_cannot_delete(self, auth_client, second_user):
        """Test that regular users cannot delete users."""
        client, _ = auth_client

        response = client.delete(f"/api/users/{second_user}")
        assert response.status_code == 403


class TestFollowUser:
    """Test follow/unfollow user endpoints."""

    def test_follow_user(self, auth_client, second_user):
        """Test following another user."""
        client, _ = auth_client

        response = client.post(f"/api/users/{second_user}/follow")
        assert response.status_code == 201
        assert response.get_json()["message"] == "followed"

    def test_cannot_follow_self(self, auth_client):
        """Test that users cannot follow themselves."""
        client, user_id = auth_client

        response = client.post(f"/api/users/{user_id}/follow")
        assert response.status_code == 400
        assert "cannot follow yourself" in response.get_json()["error"]

    def test_cannot_follow_twice(self, auth_client, second_user):
        """Test that users cannot follow the same person twice."""
        client, _ = auth_client

        # First follow
        client.post(f"/api/users/{second_user}/follow")

        # Second follow attempt
        response = client.post(f"/api/users/{second_user}/follow")
        assert response.status_code == 400
        assert "already following" in response.get_json()["error"]

    def test_unfollow_user(self, auth_client, second_user):
        """Test unfollowing a user."""
        client, _ = auth_client

        # First follow
        client.post(f"/api/users/{second_user}/follow")

        # Then unfollow
        response = client.delete(f"/api/users/{second_user}/follow")
        assert response.status_code == 200
        assert response.get_json()["message"] == "unfollowed"

    def test_unfollow_not_following(self, auth_client, second_user):
        """Test unfollowing a user you're not following."""
        client, _ = auth_client

        response = client.delete(f"/api/users/{second_user}/follow")
        assert response.status_code == 400
        assert "not following" in response.get_json()["error"]

    def test_get_followers(self, auth_client, second_user):
        """Test getting a user's followers."""
        client, user_id = auth_client

        # Follow the second user
        client.post(f"/api/users/{second_user}/follow")

        # Get second user's followers
        response = client.get(f"/api/users/{second_user}/followers")
        assert response.status_code == 200

        followers = response.get_json()
        assert len(followers) == 1
        assert followers[0]["follower_id"] == user_id

    def test_get_following(self, auth_client, second_user):
        """Test getting users someone is following."""
        client, user_id = auth_client

        # Follow the second user
        client.post(f"/api/users/{second_user}/follow")

        # Get who the first user is following
        response = client.get(f"/api/users/{user_id}/following")
        assert response.status_code == 200

        following = response.get_json()
        assert len(following) == 1
        assert following[0]["followed_id"] == second_user


class TestListExperts:
    """Test list experts endpoint."""

    def test_list_experts(self, auth_client):
        """Test listing experts."""
        client, _ = auth_client

        response = client.get("/api/users/experts")
        assert response.status_code == 200

        data = response.get_json()
        assert "experts" in data
        assert "total" in data

    def test_list_experts_unauthenticated(self, client, app):
        """Test that unauthenticated users cannot list experts."""
        response = client.get("/api/users/experts")
        assert response.status_code == 401


class TestUserInbox:
    """Test user inbox endpoint."""

    def test_get_inbox(self, auth_client):
        """Test getting user's inbox."""
        client, _ = auth_client

        response = client.get("/api/users/inbox")
        assert response.status_code == 200

        data = response.get_json()
        assert "messages" in data
        assert "total" in data
        assert "page" in data

    def test_inbox_unauthenticated(self, client, app):
        """Test that unauthenticated users cannot access inbox."""
        response = client.get("/api/users/inbox")
        assert response.status_code == 401
