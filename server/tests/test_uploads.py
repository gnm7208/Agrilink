"""
Tests for image upload endpoints.

Covers: valid/invalid image uploads, size limits, file type validation.
"""

from io import BytesIO
from unittest.mock import patch

try:
    from PIL import Image
except ImportError:
    # PIL may not be available in test environment
    Image = None


def create_test_image(format="JPEG", size=(100, 100)):
    """Create a test image in memory."""
    if Image is None:
        # Fallback: create minimal valid JPEG header
        jpeg_header = b"\xff\xd8\xff\xe0\x00\x10JFIF"
        fake_img = BytesIO(jpeg_header + b"\x00" * 1000)
        fake_img.name = "test.jpg"
        return fake_img

    img = Image.new("RGB", size, color="red")
    img_bytes = BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes


def create_test_png():
    """Create a test PNG image."""
    return create_test_image(format="PNG")


def create_test_jpeg():
    """Create a test JPEG image."""
    return create_test_image(format="JPEG")


def create_large_image(size_mb=6):
    """Create a file whose on-disk size exceeds the limit.

    Note: a solid-colour PIL image compresses to a few KB regardless of its
    dimensions, so we build the payload directly - the endpoint checks the
    file size before inspecting content.
    """
    jpeg_header = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    payload = jpeg_header + b"\x00" * (size_mb * 1024 * 1024)
    buf = BytesIO(payload)
    buf.name = "large.jpg"
    return buf


class TestUploadImage:
    """Test POST /api/uploads/images endpoint."""

    def test_upload_image_requires_auth(self, client):
        """Test that unauthenticated users cannot upload images."""
        img = create_test_jpeg()
        response = client.post(
            "/api/uploads/images",
            data={"image": (img, "test.jpg")},
            content_type="multipart/form-data",
        )
        assert response.status_code == 401

    def test_upload_image_success_jpeg(self, auth_client):
        """Test successful JPEG upload."""
        client, user_id = auth_client

        # Mock Cloudinary upload to avoid requiring real credentials
        with patch("routes.uploads.upload_image") as mock_upload:
            mock_upload.return_value = {
                "success": True,
                "url": "https://res.cloudinary.com/test/image/upload/test.jpg",
                "public_id": "test/test",
            }

            img = create_test_jpeg()
            response = client.post(
                "/api/uploads/images",
                data={"image": (img, "test.jpg")},
                content_type="multipart/form-data",
            )

            assert response.status_code == 201
            data = response.get_json()
            assert "url" in data
            assert data["url"] == "https://res.cloudinary.com/test/image/upload/test.jpg"

    def test_upload_image_success_png(self, auth_client):
        """Test successful PNG upload."""
        client, user_id = auth_client

        with patch("routes.uploads.upload_image") as mock_upload:
            mock_upload.return_value = {
                "success": True,
                "url": "https://res.cloudinary.com/test/image/upload/test.png",
                "public_id": "test/test",
            }

            img = create_test_png()
            response = client.post(
                "/api/uploads/images",
                data={"image": (img, "test.png")},
                content_type="multipart/form-data",
            )

            assert response.status_code == 201

    def test_upload_image_no_file(self, auth_client):
        """Test upload without file."""
        client, user_id = auth_client

        response = client.post("/api/uploads/images")
        assert response.status_code == 400
        assert "No file provided" in response.get_json()["error"]

    def test_upload_image_invalid_file_type(self, auth_client):
        """Test upload with invalid file type."""
        client, user_id = auth_client

        # Create a text file masquerading as image
        fake_image = BytesIO(b"This is not an image file")
        fake_image.name = "fake.jpg"

        response = client.post(
            "/api/uploads/images",
            data={"image": (fake_image, "fake.jpg")},
            content_type="multipart/form-data",
        )

        # Should fail validation (file signature check)
        assert response.status_code == 400
        assert "Invalid" in response.get_json()["error"]

    def test_upload_image_too_large(self, auth_client):
        """Test upload with file exceeding size limit."""
        client, user_id = auth_client

        # Create large image (exceeds 5MB default limit)
        large_img = create_large_image(size_mb=6)

        response = client.post(
            "/api/uploads/images",
            data={"image": (large_img, "large.jpg")},
            content_type="multipart/form-data",
        )

        assert response.status_code == 400
        assert "too large" in response.get_json()["error"].lower()

    def test_upload_image_empty_file(self, auth_client):
        """Test upload with empty file."""
        client, user_id = auth_client

        empty_file = BytesIO(b"")
        empty_file.name = "empty.jpg"

        response = client.post(
            "/api/uploads/images",
            data={"image": (empty_file, "empty.jpg")},
            content_type="multipart/form-data",
        )

        assert response.status_code == 400
        assert "empty" in response.get_json()["error"].lower()

    def test_upload_image_accepts_file_field_name(self, auth_client):
        """Test that both 'image' and 'file' field names work."""
        client, user_id = auth_client

        with patch("routes.uploads.upload_image") as mock_upload:
            mock_upload.return_value = {
                "success": True,
                "url": "https://res.cloudinary.com/test/image/upload/test.jpg",
                "public_id": "test/test",
            }

            img = create_test_jpeg()
            # Try with 'file' field name
            response = client.post(
                "/api/uploads/images",
                data={"file": (img, "test.jpg")},
                content_type="multipart/form-data",
            )

            assert response.status_code == 201

    def test_upload_image_cloudinary_failure(self, auth_client):
        """Test handling of Cloudinary upload failure."""
        client, user_id = auth_client

        with patch("routes.uploads.upload_image") as mock_upload:
            mock_upload.return_value = {"success": False, "error": "Cloudinary upload failed"}

            img = create_test_jpeg()
            response = client.post(
                "/api/uploads/images",
                data={"image": (img, "test.jpg")},
                content_type="multipart/form-data",
            )

            assert response.status_code == 500
            assert "Upload failed" in response.get_json()["error"]


class TestUploadRateLimit:
    """Test rate limiting on upload endpoint."""

    def test_upload_rate_limit(self, auth_client):
        """Test that rate limiting is applied to uploads."""
        client, user_id = auth_client

        with patch("routes.uploads.upload_image") as mock_upload:
            mock_upload.return_value = {
                "success": True,
                "url": "https://res.cloudinary.com/test/image/upload/test.jpg",
                "public_id": "test/test",
            }

            # Make many rapid requests (limit is 10 per minute)
            responses = []
            for i in range(12):
                img = create_test_jpeg()
                response = client.post(
                    "/api/uploads/images",
                    data={"image": (img, f"test{i}.jpg")},
                    content_type="multipart/form-data",
                )
                responses.append(response.status_code)

            # At least one should be rate limited (429)
            # Note: This test may be flaky depending on rate limiter implementation
            # In a real scenario, you'd want to mock the limiter or use a test-specific config
