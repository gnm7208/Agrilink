"""
Tests for the report/flag feature.

Covers: POST /api/reports, admin GET/PATCH /api/admin/reports
"""


def _second_client(app, email="second@example.com", password="SecurePass123!@#"):
    """Independent logged-in client — see test_admin.py for why this is needed."""
    second = app.test_client()
    response = second.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Second client login failed: {response.get_json()}"
    return second


class TestCreateReport:
    def test_requires_login(self, client):
        response = client.post(
            "/api/reports", json={"target_type": "post", "target_id": 1, "reason": "spam"}
        )
        assert response.status_code == 401

    def test_report_post(self, admin_client, second_user, app):
        """Admin reports a post authored by second_user."""
        admin, admin_id = admin_client
        user_client = _second_client(app, email="second@example.com")
        post_resp = user_client.post("/api/posts", json={"content": "Buy cheap fertilizer now!!!"})
        post_id = post_resp.get_json()["post"]["id"]

        response = admin.post(
            "/api/reports",
            json={"target_type": "post", "target_id": post_id, "reason": "spam", "details": "obvious spam"},
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["target_type"] == "post"
        assert data["target_id"] == post_id
        assert data["reason"] == "spam"
        assert data["status"] == "pending"
        assert data["reporter_id"] == admin_id

    def test_report_comment(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        post_resp = user_client.post("/api/posts", json={"content": "A normal post"})
        post_id = post_resp.get_json()["post"]["id"]
        comment_resp = user_client.post(
            f"/api/posts/{post_id}/comments", json={"content": "rude comment"}
        )
        comment_id = comment_resp.get_json()["id"]

        response = admin.post(
            "/api/reports",
            json={"target_type": "comment", "target_id": comment_id, "reason": "harassment"},
        )
        assert response.status_code == 201

    def test_report_user(self, admin_client, second_user):
        admin, _ = admin_client
        response = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "harassment"},
        )
        assert response.status_code == 201

    def test_invalid_target_type(self, admin_client, second_user):
        admin, _ = admin_client
        response = admin.post(
            "/api/reports",
            json={"target_type": "community", "target_id": second_user, "reason": "spam"},
        )
        assert response.status_code == 400

    def test_invalid_reason(self, admin_client, second_user):
        admin, _ = admin_client
        response = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "not-a-reason"},
        )
        assert response.status_code == 400

    def test_target_not_found(self, admin_client):
        admin, _ = admin_client
        response = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": 99999, "reason": "spam"},
        )
        assert response.status_code == 404

    def test_cannot_report_own_content(self, auth_client):
        client, user_id = auth_client
        post_resp = client.post("/api/posts", json={"content": "My own post"})
        post_id = post_resp.get_json()["post"]["id"]

        response = client.post(
            "/api/reports",
            json={"target_type": "post", "target_id": post_id, "reason": "spam"},
        )
        assert response.status_code == 400

    def test_duplicate_report_blocked(self, admin_client, second_user):
        admin, _ = admin_client
        first = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        assert first.status_code == 201

        second = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "harassment"},
        )
        assert second.status_code == 400


class TestAdminReportsModeration:
    def test_list_requires_admin(self, auth_client):
        client, _ = auth_client
        response = client.get("/api/admin/reports")
        assert response.status_code == 403

    def test_list_defaults_to_pending(self, admin_client, second_user):
        admin, _ = admin_client
        admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        response = admin.get("/api/admin/reports")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] == 1
        assert data["reports"][0]["status"] == "pending"
        assert "target_preview" in data["reports"][0]

    def test_dismiss_report(self, admin_client, second_user):
        admin, admin_id = admin_client
        create_resp = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        report_id = create_resp.get_json()["id"]

        response = admin.patch(f"/api/admin/reports/{report_id}", json={"status": "dismissed"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "dismissed"
        assert data["resolved_by"] == admin_id
        assert data["resolved_at"] is not None

        # No longer shows up in the pending queue.
        pending = admin.get("/api/admin/reports").get_json()
        assert pending["total"] == 0

    def test_resolve_report_status_validation(self, admin_client, second_user):
        admin, _ = admin_client
        create_resp = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        report_id = create_resp.get_json()["id"]

        response = admin.patch(f"/api/admin/reports/{report_id}", json={"status": "pending"})
        assert response.status_code == 400

    def test_resolve_logs_admin_action(self, admin_client, second_user):
        admin, admin_id = admin_client
        create_resp = admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        report_id = create_resp.get_json()["id"]
        admin.patch(f"/api/admin/reports/{report_id}", json={"status": "resolved"})

        log = admin.get("/api/admin/audit-log").get_json()
        entry = log["entries"][0]
        assert entry["admin_id"] == admin_id
        assert entry["action"] == "resolve_report"
        assert entry["target_type"] == "report"
        assert entry["target_id"] == report_id

    def test_filter_by_target_type(self, admin_client, second_user, app):
        admin, _ = admin_client
        user_client = _second_client(app, email="second@example.com")
        post_resp = user_client.post("/api/posts", json={"content": "spammy post"})
        post_id = post_resp.get_json()["post"]["id"]

        admin.post(
            "/api/reports",
            json={"target_type": "user", "target_id": second_user, "reason": "spam"},
        )
        admin.post(
            "/api/reports",
            json={"target_type": "post", "target_id": post_id, "reason": "spam"},
        )

        response = admin.get("/api/admin/reports?target_type=post")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] == 1
        assert data["reports"][0]["target_type"] == "post"
