"""
Tests for the rule-based Crop Issue Helper.

Covers: GET /api/crop-helper/symptoms, POST /api/crop-helper/diagnose
"""


class TestSymptoms:
    def test_symptoms_shape(self, client):
        response = client.get("/api/crop-helper/symptoms")
        assert response.status_code == 200
        data = response.get_json()
        assert "crops" in data
        assert "symptoms" in data
        assert "maize" in data["crops"]
        assert any(s["id"] == "yellowing_leaves" for s in data["symptoms"])

    def test_symptoms_does_not_require_login(self, client):
        response = client.get("/api/crop-helper/symptoms")
        assert response.status_code == 200


class TestDiagnose:
    def test_requires_login(self, client):
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "maize", "symptoms": ["holes_in_leaves"]},
        )
        assert response.status_code == 401

    def test_known_combo_matches_fall_armyworm(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={
                "crop": "maize",
                "symptoms": ["holes_in_leaves", "chewed_stems", "stunted_growth"],
            },
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["no_match"] is False
        top = data["matches"][0]
        assert top["id"] == "fall-armyworm"
        assert top["confidence"] == "high"

    def test_generic_symptom_matches_any_crop_issue(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "kale", "symptoms": ["root_rot", "wilting", "yellowing_leaves"]},
        )
        assert response.status_code == 200
        data = response.get_json()
        names = [m["id"] for m in data["matches"]]
        assert "root-rot" in names

    def test_no_match_case(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "maize", "symptoms": ["white_powdery_coating"]},
        )
        assert response.status_code == 200
        data = response.get_json()
        # powdery-mildew is crop_tags "any" so it should still match.
        assert data["no_match"] is False
        assert data["matches"][0]["id"] == "powdery-mildew"

    def test_invalid_crop(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "not-a-crop", "symptoms": ["wilting"]},
        )
        assert response.status_code == 400

    def test_invalid_symptom(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "maize", "symptoms": ["not-a-real-symptom"]},
        )
        assert response.status_code == 400

    def test_empty_symptoms(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "maize", "symptoms": []},
        )
        assert response.status_code == 400

    def test_crop_scoped_issue_does_not_leak_to_other_crops(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "beans", "symptoms": ["holes_in_leaves", "chewed_stems"]},
        )
        assert response.status_code == 200
        names = [m["id"] for m in response.get_json()["matches"]]
        assert "fall-armyworm" not in names

    def test_new_crop_rice_blast(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "rice", "symptoms": ["brown_spots", "leaf_drop"]},
        )
        assert response.status_code == 200
        names = [m["id"] for m in response.get_json()["matches"]]
        assert "rice-blast" in names

    def test_new_crop_with_space_in_name(self, auth_client):
        client, _ = auth_client
        response = client.post(
            "/api/crop-helper/diagnose",
            json={"crop": "sweet potatoes", "symptoms": ["mosaic_pattern", "stunted_growth"]},
        )
        assert response.status_code == 200
        names = [m["id"] for m in response.get_json()["matches"]]
        assert "sweet-potato-virus-disease" in names
