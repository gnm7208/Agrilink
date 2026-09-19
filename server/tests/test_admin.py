"""
Tests for the admin dashboard endpoints.

Covers: /api/admin (stats, user moderation, community/content moderation, audit log)
"""

from extensions import db
from models import Role


def _second_client(app, email="second@example.com", password="SecurePass123!@#"):
    """
    A logged-in client independent of the shared `client`/`auth_client`/
    `admin_client` fixtures, which all reuse the same session cookie jar and
    so cannot represent two simultaneously-authenticated users. Used when a
    test needs an admin session and a different user's session at once.
    """
    second = app.test_client()
    response = second.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Second client login failed: {response.get_json()}"
    return second


class TestAdminAccessControl:
    """Every admin route must reject anonymous and non-admin callers."""

    def test_stats_requires_login(self, client):
        response = client.get("/api/admin/stats")
        assert response.status_code == 401

    def test_stats_requires_admin_role(self, auth_client):
        client, _ = auth_client
        response = client.get("/api/admin/stats")
        assert response.status_code == 403

    def test_admin_can_access_stats(self, admin_client):
        client, _ = admin_client
        response = client.get("/api/admin/stats")
        assert response.status_code == 200


class TestAdminStats:
    def test_stats_shape_and_counts(self, admin_client, second_user):
        client, _ = admin_client
        response = client.get("/api/admin/stats")
        assert response.status_code == 200

        data = response.get_json()
        # admin + second_user = 2 users
        assert data["total_users"] == 2
        assert data["new_users_7d"] >= 2
        assert data["total_posts"] == 0
        assert data["total_communities"] == 0
        assert "new_users_by_day" in data
        assert isinstance(data["new_users_by_day"], list)


class TestAdminUserManagement:
    def test_list_users(self, admin_client, second_user):
        client, _ = admin_client
        response = client.get("/api/admin/users")
        assert response.status_code == 200

        data = response.get_json()
        assert data["total"] == 2
        assert any(u["id"] == second_user for u in data["users"])

    def test_list_users_search(self, admin_client, second_user):
        client, _ = admin_client
        response = client.get("/api/admin/users?search=second")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] == 1
        assert data["users"][0]["id"] == second_user

    def test_get_user_detail(self, admin_client, second_user):
        client, _ = admin_client
        response = client.get(f"/api/admin/users/{second_user}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == second_user
        assert "recent_posts" in data
        assert "posts_count" in data

    def test_get_user_detail_not_found(self, admin_client):
        client, _ = admin_client
        response = client.get("/api/admin/users/99999")
        assert response.status_code == 404

    def test_suspend_and_reactivate_user(self, admin_client, second_user):
        client, _ = admin_client

        response = client.patch(
            f"/api/admin/users/{second_user}/status",
            json={"status": "suspended", "reason": "spam"},
        )
        assert response.status_code == 200
        assert response.get_json()["status"] == "suspended"

        response = client.patch(f"/api/admin/users/{second_user}/status", json={"status": "active"})
        assert response.status_code == 200
        assert response.get_json()["status"] == "active"

    def test_suspended_user_is_logged_out_and_cannot_log_back_in(
        self, admin_client, create_user, app
    ):
        admin, _ = admin_client
        user_id = create_user(
            username="tobesuspended", email="suspend@example.com", password="SecurePass123!@#"
        )
        user_client = _second_client(app, email="suspend@example.com")

        # Session already established for `user_client`; verify it works pre-suspension.
        assert user_client.get("/api/auth/me").get_json()["authenticated"] is True

        admin.patch(f"/api/admin/users/{user_id}/status", json={"status": "suspended"})

        # Same session should now read as logged out.
        assert user_client.get("/api/auth/me").get_json()["authenticated"] is False

        # And a fresh login attempt must be rejected.
        relogin = user_client.post(
            "/api/auth/login",
            json={"email": "suspend@example.com", "password": "SecurePass123!@#"},
        )
        assert relogin.status_code == 403

    def test_status_requires_valid_value(self, admin_client, second_user):
        client, _ = admin_client
        response = client.patch(
            f"/api/admin/users/{second_user}/status", json={"status": "not-a-status"}
        )
        assert response.status_code == 400

    def test_cannot_change_own_status(self, admin_client):
        client, admin_id = admin_client
        response = client.patch(f"/api/admin/users/{admin_id}/status", json={"status": "suspended"})
        assert response.status_code == 400

    def test_change_role(self, admin_client, second_user, app):
        client, _ = admin_client
        with app.app_context():
            db.session.add(Role(name="expert"))
            db.session.commit()

        response = client.patch(f"/api/admin/users/{second_user}/role", json={"role": "expert"})
        assert response.status_code == 200
        assert response.get_json()["role"] == "expert"

    def test_role_requires_existing_role(self, admin_client, second_user):
        client, _ = admin_client
        response = client.patch(f"/api/admin/users/{second_user}/role", json={"role": "superuser"})
        assert response.status_code == 400

    def test_cannot_change_own_role(self, admin_client):
        client, admin_id = admin_client
        response = client.patch(f"/api/admin/users/{admin_id}/role", json={"role": "user"})
        assert response.status_code == 400

    def test_delete_user_with_content_cascades_cleanly(self, admin_client, second_user, app):
        """
        Regression test: the schema has no ON DELETE CASCADE, so deleting a
        user who has posts/comments/likes/messages/community-membership must
        not raise an IntegrityError.
        """
        admin, admin_id = admin_client
        user_id = second_user
        user_client = _second_client(app, email="second@example.com")

        post_resp = user_client.post(
            "/api/posts", json={"title": "Hello", "content": "This is a test post body"}
        )
        assert post_resp.status_code == 201
        post_id = post_resp.get_json()["post"]["id"]

        user_client.post(f"/api/posts/{post_id}/like")
        user_client.post(f"/api/posts/{post_id}/comments", json={"content": "Nice post"})
        user_client.post(
            "/api/messages",
            json={"receiver_id": admin_id, "content": "hi"},
        )
        user_client.post("/api/communities", json={"name": "Second user's community"})

        response = admin.delete(f"/api/admin/users/{user_id}", json={"reason": "policy"})
        assert response.status_code == 200

        # The user and their post are actually gone.
        assert admin.get(f"/api/admin/users/{user_id}").status_code == 404
        assert admin.get(f"/api/posts/{post_id}").status_code == 404

    def test_cannot_delete_own_account(self, admin_client):
        client, admin_id = admin_client
        response = client.delete(f"/api/admin/users/{admin_id}")
        assert response.status_code == 400

    def test_cannot_delete_another_admin(self, admin_client, create_user):
        client, _ = admin_client
        other_admin_id = create_user(
            username="otheradmin", email="otheradmin@example.com", role="admin"
        )
        response = client.delete(f"/api/admin/users/{other_admin_id}")
        assert response.status_code == 400


class TestAdminCommunityAndContentModeration:
    def test_list_communities(self, admin_client):
        client, _ = admin_client
        client.post("/api/communities", json={"name": "Test Community"})

        response = client.get("/api/admin/communities")
        assert response.status_code == 200
        assert response.get_json()["total"] == 1

    def test_admin_can_delete_any_community(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        create_resp = user_client.post("/api/communities", json={"name": "Someone else's group"})
        community_id = create_resp.get_json()["id"]

        response = admin.delete(f"/api/communities/{community_id}")
        assert response.status_code == 200

    def test_list_posts_for_moderation(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        user_client.post("/api/posts", json={"content": "A post that needs review"})

        response = admin.get("/api/admin/posts")
        assert response.status_code == 200
        assert response.get_json()["total"] == 1

    def test_admin_can_delete_any_post(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        post_resp = user_client.post("/api/posts", json={"content": "Inappropriate content"})
        post_id = post_resp.get_json()["post"]["id"]

        response = admin.delete(f"/api/admin/posts/{post_id}", json={"reason": "bad language"})
        assert response.status_code == 200
        assert user_client.get(f"/api/posts/{post_id}").status_code == 404

    def test_admin_can_delete_any_comment(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        post_resp = user_client.post("/api/posts", json={"content": "A normal post"})
        post_id = post_resp.get_json()["post"]["id"]
        comment_resp = user_client.post(
            f"/api/posts/{post_id}/comments", json={"content": "rude comment"}
        )
        comment_id = comment_resp.get_json()["id"]

        response = admin.delete(f"/api/admin/comments/{comment_id}")
        assert response.status_code == 200


class TestAdminAuditLog:
    def test_actions_are_logged(self, admin_client, second_user):
        client, admin_id = admin_client
        client.patch(f"/api/admin/users/{second_user}/status", json={"status": "banned"})

        response = client.get("/api/admin/audit-log")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] >= 1
        entry = data["entries"][0]
        assert entry["admin_id"] == admin_id
        assert entry["action"] == "set_status_banned"
        assert entry["target_type"] == "user"
        assert entry["target_id"] == second_user

    def test_filter_by_action(self, admin_client, second_user):
        client, _ = admin_client
        client.patch(f"/api/admin/users/{second_user}/status", json={"status": "banned"})
        client.patch(f"/api/admin/users/{second_user}/status", json={"status": "active"})

        response = client.get("/api/admin/audit-log?action=set_status_banned")
        assert response.status_code == 200
        data = response.get_json()
        assert all(e["action"] == "set_status_banned" for e in data["entries"])
        assert data["total"] == 1
