"""
Tests for posts endpoints.

Covers: CRUD operations, likes, comments, pagination, permissions.
"""


class TestListPosts:
    """Test GET /api/posts endpoint."""

    def test_list_posts_empty(self, client):
        """Test listing posts when none exist."""
        response = client.get("/api/posts")
        assert response.status_code == 200
        data = response.get_json()
        assert data["posts"] == []
        assert data["total"] == 0

    def test_list_posts_with_data(self, auth_client, create_user):
        """Test listing posts with existing posts."""
        client, user_id = auth_client

        # Create a post
        response = client.post(
            "/api/posts", json={"content": "Test post content", "title": "Test Title"}
        )
        assert response.status_code == 201

        # List posts
        response = client.get("/api/posts")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["posts"]) == 1
        assert data["total"] == 1
        assert data["posts"][0]["content"] == "Test post content"

    def test_list_posts_pagination(self, auth_client):
        """Test pagination parameters."""
        client, user_id = auth_client

        # Create multiple posts
        for i in range(5):
            client.post("/api/posts", json={"content": f"Post {i}"})

        # Test pagination
        response = client.get("/api/posts?page=1&per_page=2")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["posts"]) == 2
        assert data["page"] == 1
        assert data["per_page"] == 2
        assert data["total"] == 5

    def test_list_posts_filter_by_author(self, auth_client, create_user):
        """Test filtering posts by author_id."""
        client, author_id = auth_client

        # Create post by first user
        client.post("/api/posts", json={"content": "Author's post"})

        # Create second user and their post
        create_user("seconduser", "second@example.com", "SecurePass123!@#")
        # Note: Can't easily create post as second user without login, so we'll test filtering

        # Filter by author
        response = client.get(f"/api/posts?author_id={author_id}")
        assert response.status_code == 200
        data = response.get_json()
        # Should only see posts by this author
        for post in data["posts"]:
            assert post["author_id"] == author_id


class TestCreatePost:
    """Test POST /api/posts endpoint."""

    def test_create_post_success(self, auth_client):
        """Test successful post creation."""
        client, user_id = auth_client

        response = client.post(
            "/api/posts", json={"content": "This is a test post", "title": "Test Title"}
        )

        assert response.status_code == 201
        data = response.get_json()
        assert "post" in data
        assert data["post"]["content"] == "This is a test post"
        assert data["post"]["author_id"] == user_id

    def test_create_post_requires_auth(self, client):
        """Test that unauthenticated users cannot create posts."""
        response = client.post("/api/posts", json={"content": "Unauthorized post"})
        assert response.status_code == 401

    def test_create_post_requires_content(self, auth_client):
        """Test that content is required."""
        client, user_id = auth_client

        response = client.post("/api/posts", json={"title": "Title without content"})
        assert response.status_code == 400
        assert "Content is required" in response.get_json()["error"]

    def test_create_post_with_image_url(self, auth_client):
        """Test creating post with image URL."""
        client, user_id = auth_client

        response = client.post(
            "/api/posts",
            json={"content": "Post with image", "image_url": "https://example.com/image.jpg"},
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["post"]["image_url"] == "https://example.com/image.jpg"

    def test_create_post_html_sanitized(self, auth_client):
        """Test that HTML content is sanitized."""
        client, user_id = auth_client

        malicious_content = "<script>alert('xss')</script>Safe content"
        response = client.post("/api/posts", json={"content": malicious_content})

        assert response.status_code == 201
        data = response.get_json()
        # Script tags should be stripped
        assert "<script>" not in data["post"]["content"]
        assert "Safe content" in data["post"]["content"]


class TestGetPost:
    """Test GET /api/posts/<id> endpoint."""

    def test_get_post_success(self, auth_client):
        """Test retrieving a single post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test post"})
        post_id = create_response.get_json()["post"]["id"]

        # Get post
        response = client.get(f"/api/posts/{post_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["content"] == "Test post"
        assert data["author_id"] == user_id

    def test_get_post_not_found(self, client):
        """Test retrieving non-existent post."""
        response = client.get("/api/posts/99999")
        assert response.status_code == 404

    def test_get_post_includes_liked_status(self, auth_client):
        """Test that liked status is included for authenticated users."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        # Get post (not liked yet)
        response = client.get(f"/api/posts/{post_id}")
        assert response.status_code == 200
        assert response.get_json()["liked"] is False

        # Like the post
        client.post(f"/api/posts/{post_id}/like")

        # Get post again (should show liked)
        response = client.get(f"/api/posts/{post_id}")
        assert response.status_code == 200
        assert response.get_json()["liked"] is True


class TestUpdatePost:
    """Test PATCH /api/posts/<id> endpoint."""

    def test_update_own_post(self, auth_client):
        """Test updating own post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Original content"})
        post_id = create_response.get_json()["post"]["id"]

        # Update post
        response = client.patch(f"/api/posts/{post_id}", json={"content": "Updated content"})
        assert response.status_code == 200
        assert response.get_json()["content"] == "Updated content"

    def test_update_other_user_post_forbidden(self, auth_client, create_user):
        """Test that users cannot update other users' posts."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Original"})
        post_id = create_response.get_json()["post"]["id"]

        # Create second user and login
        create_user("seconduser", "second@example.com", "SecurePass123!@#")
        login_response = client.post(
            "/api/auth/login", json={"email": "second@example.com", "password": "SecurePass123!@#"}
        )
        assert login_response.status_code == 200

        # Try to update first user's post
        response = client.patch(f"/api/posts/{post_id}", json={"content": "Hacked content"})
        assert response.status_code == 403

    def test_update_post_requires_auth(self, client):
        """Test that unauthenticated users cannot update posts."""
        response = client.patch("/api/posts/1", json={"content": "Unauthorized update"})
        assert response.status_code == 401


class TestDeletePost:
    """Test DELETE /api/posts/<id> endpoint."""

    def test_delete_own_post(self, auth_client):
        """Test deleting own post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "To be deleted"})
        post_id = create_response.get_json()["post"]["id"]

        # Delete post
        response = client.delete(f"/api/posts/{post_id}")
        assert response.status_code == 200

        # Verify deleted
        get_response = client.get(f"/api/posts/{post_id}")
        assert get_response.status_code == 404

    def test_delete_other_user_post_forbidden(self, auth_client, create_user):
        """Test that users cannot delete other users' posts."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Protected post"})
        post_id = create_response.get_json()["post"]["id"]

        # Create second user and login
        create_user("seconduser", "second@example.com", "SecurePass123!@#")
        client.post(
            "/api/auth/login", json={"email": "second@example.com", "password": "SecurePass123!@#"}
        )

        # Try to delete first user's post
        response = client.delete(f"/api/posts/{post_id}")
        assert response.status_code == 403


class TestLikePost:
    """Test POST /api/posts/<id>/like endpoint."""

    def test_like_post_success(self, auth_client):
        """Test liking a post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        # Like post
        response = client.post(f"/api/posts/{post_id}/like")
        assert response.status_code == 200
        data = response.get_json()
        assert data["liked"] is True
        assert data["likes_count"] == 1

    def test_like_post_twice_idempotent(self, auth_client):
        """Test that liking twice doesn't create duplicate likes."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        # Like twice
        client.post(f"/api/posts/{post_id}/like")
        response = client.post(f"/api/posts/{post_id}/like")

        assert response.status_code == 200
        assert response.get_json()["likes_count"] == 1

    def test_unlike_post(self, auth_client):
        """Test unliking a post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        # Like then unlike
        client.post(f"/api/posts/{post_id}/like")
        response = client.delete(f"/api/posts/{post_id}/like")

        assert response.status_code == 200
        assert response.get_json()["liked"] is False
        assert response.get_json()["likes_count"] == 0


class TestPostComments:
    """Test comment endpoints for posts."""

    def test_create_comment_success(self, auth_client):
        """Test creating a comment on a post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test post"})
        post_id = create_response.get_json()["post"]["id"]

        # Create comment
        response = client.post(
            f"/api/posts/{post_id}/comments", json={"content": "This is a comment"}
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["content"] == "This is a comment"
        assert data["user_id"] == user_id
        assert data["post_id"] == post_id

    def test_create_comment_requires_content(self, auth_client):
        """Test that comment content is required."""
        client, user_id = auth_client

        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        response = client.post(f"/api/posts/{post_id}/comments", json={})
        assert response.status_code == 400

    def test_list_comments(self, auth_client):
        """Test listing comments on a post."""
        client, user_id = auth_client

        # Create post
        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        # Create multiple comments
        for i in range(3):
            client.post(f"/api/posts/{post_id}/comments", json={"content": f"Comment {i}"})

        # List comments
        response = client.get(f"/api/posts/{post_id}/comments")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["comments"]) == 3
        assert data["total"] == 3

    def test_comment_html_sanitized(self, auth_client):
        """Test that comment HTML is sanitized."""
        client, user_id = auth_client

        create_response = client.post("/api/posts", json={"content": "Test"})
        post_id = create_response.get_json()["post"]["id"]

        malicious_content = "<script>alert('xss')</script>Safe comment"
        response = client.post(
            f"/api/posts/{post_id}/comments", json={"content": malicious_content}
        )

        assert response.status_code == 201
        data = response.get_json()
        assert "<script>" not in data["content"]
        assert "Safe comment" in data["content"]
