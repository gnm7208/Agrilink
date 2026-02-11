"""
Cloudinary upload utilities for AgriLink.

Handles image uploads with validation and error handling.
"""
import imghdr
from io import BytesIO

import cloudinary
import cloudinary.uploader
from flask import current_app


class CloudinaryError(Exception):
    """Custom exception for Cloudinary operations."""
    pass


def configure_cloudinary():
    """
    Configure Cloudinary SDK from Flask app config.

    Must be called within Flask application context.
    Raises CloudinaryError if credentials are missing.
    """
    cloud_name = current_app.config.get("CLOUDINARY_CLOUD_NAME")
    api_key = current_app.config.get("CLOUDINARY_API_KEY")
    api_secret = current_app.config.get("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise CloudinaryError(
            "Cloudinary credentials not configured. "
            "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True  # Always use HTTPS
    )


def _sniff_image_type(file) -> str | None:
    """
    Inspect the file header to verify it is a real image.

    MIME types can be spoofed; this provides a lightweight signature check
    using Python's standard library before we send the file to Cloudinary.
    """
    # Read a small header chunk without consuming the stream for upload.
    current_pos = file.tell()
    try:
        header = file.read(512)
    finally:
        file.seek(current_pos)

    kind = imghdr.what(None, h=header)

    # imghdr may not recognize webp; handle a minimal signature check.
    if not kind and header.startswith(b"RIFF") and b"WEBP" in header[:16]:
        return "webp"

    return kind


def validate_image_file(file):
    """
    Validate uploaded image file.

    Args:
        file: FileStorage object from request.files

    Returns:
        dict with 'valid' boolean and 'error' message if invalid
    """
    if not file or file.filename == "":
        return {"valid": False, "error": "No file provided"}

    # Check MIME type
    allowed_types = current_app.config.get(
        "ALLOWED_IMAGE_TYPES",
        {"image/jpeg", "image/png", "image/gif", "image/webp"},
    )

    if file.content_type not in allowed_types:
        return {
            "valid": False,
            "error": f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        }

    # Check file size (read content length or file size)
    max_size_mb = current_app.config.get("MAX_IMAGE_SIZE_MB", 5)
    max_size_bytes = max_size_mb * 1024 * 1024

    # Get file size by seeking to end
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning for upload

    if file_size > max_size_bytes:
        return {
            "valid": False,
            "error": f"File too large. Maximum size is {max_size_mb}MB",
        }

    if file_size == 0:
        return {"valid": False, "error": "File is empty"}

    # Lightweight signature check to ensure this is really an image.
    detected_type = _sniff_image_type(file)
    if detected_type is None:
        return {
            "valid": False,
            "error": "Invalid image file. File header does not match a supported image type.",
        }

    return {"valid": True, "error": None}


def upload_image(file, folder="agrilink"):
    """
    Upload image to Cloudinary.

    Args:
        file: FileStorage object from request.files
        folder: Cloudinary folder to organize uploads (default: 'agrilink')

    Returns:
        dict with 'success', 'url', and 'public_id' on success
        dict with 'success' False and 'error' on failure
    """
    try:
        configure_cloudinary()

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
            # Let Cloudinary handle format optimization
            allowed_formats=["jpg", "jpeg", "png", "gif", "webp"],
        )

        return {
            "success": True,
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }

    except CloudinaryError as e:
        current_app.logger.error(f"Cloudinary config error: {e}")
        return {"success": False, "error": str(e)}

    except cloudinary.exceptions.Error as e:
        current_app.logger.error(f"Cloudinary upload error: {e}")
        return {"success": False, "error": "Image upload failed. Please try again."}

    except Exception as e:
        current_app.logger.error(f"Unexpected upload error: {e}")
        return {"success": False, "error": "An unexpected error occurred during upload."}
