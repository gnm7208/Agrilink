"""
Tests for community management endpoints.

Covers: /api/communities endpoints (list, create, join, leave, members, posts)
"""


class TestHealthCheck:
    """Test health check endpoint."""

    def test_communities_health(self, client):
        """Test communities service health check."""
        response = client.get("/api/communities/health")
        assert response.status_code == 200
        assert response.get_json()["status"] == "communities service running"


class TestListCommunities:
    """Test list communities endpoint."""

    def test_list_communities_empty(self, auth_client):
        """Test listing communities when none exist."""
        client, _ = auth_client

        response = client.get("/api/communities")
        assert response.status_code == 200

        data = response.get_json()
        assert data["communities"] == []
        assert data["total"] == 0

    def test_list_communities_with_data(self, auth_client, sample_community):
        """Test listing communities when some exist."""
        client, _ = auth_client

        response = client.get("/api/communities")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["communities"]) >= 1
        assert data["total"] >= 1

    def test_list_communities_pagination(self, auth_client):
        """Test community listing pagination."""
        client, _ = auth_client

        # Create multiple communities
        for i in range(5):
            client.post(
                "/api/communities",
                json={"name": f"Test Community {i}", "description": f"Description {i}"},
            )

        # Test pagination
        response = client.get("/api/communities?page=1&per_page=3")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["communities"]) == 3
        assert data["per_page"] == 3

    def test_list_communities_unauthenticated(self, client, app):
        """Test that unauthenticated users cannot list communities."""
        response = client.get("/api/communities")
        assert response.status_code == 401


class TestCreateCommunity:
    """Test create community endpoint."""

    def test_create_community_success(self, auth_client):
        """Test successful community creation."""
        client, user_id = auth_client

        response = client.post(
            "/api/communities",
            json={
                "name": "New Community",
                "description": "A great community",
                "image_url": "https://example.com/image.jpg",
            },
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "New Community"
        assert data["description"] == "A great community"
        assert data["created_by"] == user_id

    def test_create_community_minimal(self, auth_client):
        """Test creating community with only required fields."""
        client, _ = auth_client

        response = client.post("/api/communities", json={"name": "Minimal Community"})

        assert response.status_code == 201
        assert response.get_json()["name"] == "Minimal Community"

    def test_create_community_missing_name(self, auth_client):
        """Test creating community without name."""
        client, _ = auth_client

        response = client.post("/api/communities", json={"description": "No name community"})

        assert response.status_code == 400
        assert "name is required" in response.get_json()["error"]

    def test_create_community_empty_name(self, auth_client):
        """Test creating community with empty name."""
        client, _ = auth_client

        response = client.post(
            "/api/communities", json={"name": "   ", "description": "Empty name"}
        )

        assert response.status_code == 400

    def test_creator_auto_joined(self, auth_client):
        """Test that creator is automatically a member."""
        client, user_id = auth_client

        # Create community
        response = client.post("/api/communities", json={"name": "Auto Join Test"})
        community_id = response.get_json()["id"]

        # Check members
        response = client.get(f"/api/communities/{community_id}/members")
        members = response.get_json()["members"]

        member_user_ids = [m["user_id"] for m in members]
        assert user_id in member_user_ids


class TestJoinCommunity:
    """Test join community endpoint."""

    def test_join_community_success(self, auth_client, app):
        """Test successfully joining a community."""
        client, user_id = auth_client

        # Create a community as another user first
        with app.app_context():
            from extensions import db
            from models import Community, User

            other_user = User(username="creator", email="creator@example.com")
            other_user.set_password("SecurePass123!@#")
            other_user.set_role_by_name("user")
            db.session.add(other_user)
            db.session.commit()

            community = Community(
                name="Join Test Community", description="Test", created_by=other_user.id
            )
            db.session.add(community)
            db.session.commit()
            community_id = community.id

        # Join as the authenticated user
        response = client.post(f"/api/communities/{community_id}/join")
        assert response.status_code == 201

        data = response.get_json()
        assert data["user_id"] == user_id
        assert data["community_id"] == community_id

    def test_join_community_already_member(self, auth_client, sample_community):
        """Test joining a community you're already a member of."""
        client, _ = auth_client

        # Creator is auto-joined, so this should fail
        response = client.post(f"/api/communities/{sample_community['id']}/join")
        assert response.status_code == 400
        assert "already a member" in response.get_json()["error"]

    def test_join_nonexistent_community(self, auth_client):
        """Test joining a community that doesn't exist."""
        client, _ = auth_client

        response = client.post("/api/communities/99999/join")
        assert response.status_code == 404


class TestLeaveCommunity:
    """Test leave community endpoint."""

    def test_leave_community_success(self, auth_client, sample_community):
        """Test successfully leaving a community."""
        client, _ = auth_client

        response = client.delete(f"/api/communities/{sample_community['id']}/leave")
        assert response.status_code == 200
        assert response.get_json()["message"] == "left community"

    def test_leave_community_not_member(self, auth_client, sample_community):
        """Test leaving a community you're not a member of."""
        client, _ = auth_client

        # First leave
        client.delete(f"/api/communities/{sample_community['id']}/leave")

        # Try to leave again
        response = client.delete(f"/api/communities/{sample_community['id']}/leave")
        assert response.status_code == 400
        assert "not a member" in response.get_json()["error"]

    def test_leave_nonexistent_community(self, auth_client):
        """Test leaving a community that doesn't exist."""
        client, _ = auth_client

        response = client.delete("/api/communities/99999/leave")
        assert response.status_code == 404


class TestCommunityMembers:
    """Test community members endpoint."""

    def test_get_members(self, auth_client, sample_community):
        """Test getting community members."""
        client, user_id = auth_client

        response = client.get(f"/api/communities/{sample_community['id']}/members")
        assert response.status_code == 200

        data = response.get_json()
        assert "members" in data
        assert "total" in data
        assert len(data["members"]) >= 1

    def test_get_members_pagination(self, auth_client, sample_community, app):
        """Test member listing pagination."""
        client, _ = auth_client

        # Add more members
        with app.app_context():
            from extensions import db
            from models import CommunityMembership, User

            for i in range(5):
                user = User(username=f"member{i}", email=f"member{i}@example.com")
                user.set_password("SecurePass123!@#")
                user.set_role_by_name("user")
                db.session.add(user)
                db.session.commit()

                membership = CommunityMembership(
                    user_id=user.id, community_id=sample_community["id"]
                )
                db.session.add(membership)
                db.session.commit()

        response = client.get(
            f"/api/communities/{sample_community['id']}/members?page=1&per_page=3"
        )
        assert response.status_code == 200
        assert len(response.get_json()["members"]) == 3

    def test_get_members_nonexistent_community(self, auth_client):
        """Test getting members of non-existent community."""
        client, _ = auth_client

        response = client.get("/api/communities/99999/members")
        assert response.status_code == 404


class TestCommunityPosts:
    """Test community posts endpoint."""

    def test_get_posts_empty(self, auth_client, sample_community):
        """Test getting posts from community with no posts."""
        client, _ = auth_client

        response = client.get(f"/api/communities/{sample_community['id']}/posts")
        assert response.status_code == 200

        data = response.get_json()
        assert data["posts"] == []
        assert data["total"] == 0

    def test_get_posts_with_data(self, auth_client, sample_community, app):
        """Test getting posts from community with posts."""
        client, user_id = auth_client

        # Add a post to the community
        with app.app_context():
            from extensions import db
            from models import Post

            post = Post(
                author_id=user_id,
                community_id=sample_community["id"],
                title="Test Post",
                content="Test content",
            )
            db.session.add(post)
            db.session.commit()

        response = client.get(f"/api/communities/{sample_community['id']}/posts")
        assert response.status_code == 200

        data = response.get_json()
        assert len(data["posts"]) == 1
        assert data["posts"][0]["title"] == "Test Post"


class TestDeleteCommunity:
    """Test delete community endpoint (admin only)."""

    def test_admin_can_delete_community(self, admin_client, app):
        """Test that admin can delete communities."""
        client, admin_id = admin_client

        # Create a community
        with app.app_context():
            from extensions import db
            from models import Community

            community = Community(
                name="To Delete", description="Will be deleted", created_by=admin_id
            )
            db.session.add(community)
            db.session.commit()
            community_id = community.id

        response = client.delete(f"/api/communities/{community_id}")
        assert response.status_code == 200
        assert response.get_json()["message"] == "community deleted"

    def test_regular_user_cannot_delete(self, auth_client, sample_community):
        """Test that regular users cannot delete communities."""
        client, _ = auth_client

        response = client.delete(f"/api/communities/{sample_community['id']}")
        assert response.status_code == 403
