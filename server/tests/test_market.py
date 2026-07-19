"""
Tests for the local market price board.

Covers: /api/market-prices (list, crops, create, delete)
"""


def _second_client(app, email="second@example.com", password="SecurePass123!@#"):
    """Independent logged-in client — see test_admin.py for why this is needed."""
    second = app.test_client()
    response = second.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Second client login failed: {response.get_json()}"
    return second


class TestListPrices:
    def test_list_empty(self, client):
        response = client.get("/api/market-prices")
        assert response.status_code == 200
        data = response.get_json()
        assert data["prices"] == []
        assert data["total"] == 0

    def test_list_does_not_require_login(self, auth_client, app):
        auth, _ = auth_client
        auth.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        anonymous = app.test_client()
        response = anonymous.get("/api/market-prices")
        assert response.status_code == 200
        assert response.get_json()["total"] == 1

    def test_filter_by_crop_and_location(self, auth_client):
        client, _ = auth_client
        client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        client.post(
            "/api/market-prices",
            json={"crop": "Beans", "price": 8500, "unit": "per 90kg bag", "location": "Eldoret"},
        )

        response = client.get("/api/market-prices?crop=maize")
        assert response.get_json()["total"] == 1

        response = client.get("/api/market-prices?location=eldoret")
        data = response.get_json()
        assert data["total"] == 1
        assert data["prices"][0]["crop"] == "Beans"

    def test_list_crops_distinct(self, auth_client):
        client, _ = auth_client
        client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3300, "unit": "per 90kg bag", "location": "Eldoret"},
        )
        response = client.get("/api/market-prices/crops")
        assert response.status_code == 200
        assert response.get_json()["crops"] == ["Maize"]


class TestCreatePrice:
    def test_requires_login(self, client):
        response = client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        assert response.status_code == 401

    def test_create_success(self, auth_client):
        client, user_id = auth_client
        response = client.post(
            "/api/market-prices",
            json={
                "crop": "Maize",
                "price": 3200,
                "unit": "per 90kg bag",
                "location": "Nakuru, Kenya",
                "notes": "Selling direct to cooperative",
            },
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["crop"] == "Maize"
        assert data["price"] == 3200
        assert data["posted_by"] == user_id
        assert data["notes"] == "Selling direct to cooperative"

    def test_missing_crop(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/market-prices",
            json={"price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        assert response.status_code == 400

    def test_invalid_price(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": -5, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        assert response.status_code == 400

    def test_missing_location(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag"},
        )
        assert response.status_code == 400


class TestDeletePrice:
    def test_owner_can_delete(self, auth_client):
        client, _ = auth_client
        create_resp = client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        price_id = create_resp.get_json()["id"]

        response = client.delete(f"/api/market-prices/{price_id}")
        assert response.status_code == 200
        assert client.get("/api/market-prices").get_json()["total"] == 0

    def test_other_user_forbidden(self, auth_client, second_user, app):
        client, _ = auth_client
        create_resp = client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        price_id = create_resp.get_json()["id"]

        other_client = _second_client(app, email="second@example.com")
        response = other_client.delete(f"/api/market-prices/{price_id}")
        assert response.status_code == 403

    def test_admin_can_delete_any(self, admin_client, second_user, app):
        user_client = _second_client(app, email="second@example.com")
        create_resp = user_client.post(
            "/api/market-prices",
            json={"crop": "Maize", "price": 3200, "unit": "per 90kg bag", "location": "Nakuru"},
        )
        price_id = create_resp.get_json()["id"]

        admin, _ = admin_client
        response = admin.delete(f"/api/market-prices/{price_id}")
        assert response.status_code == 200
