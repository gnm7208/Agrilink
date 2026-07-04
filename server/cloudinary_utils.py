"""
Cloudinary upload utilities for AgriLink.

Handles image uploads with validation and error handling.
"""

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

    # If any credential is missing, raise the error for production usage.
    # For local development we allow a graceful fallback handled by upload_image().
    if not all([cloud_name, api_key, api_secret]):
        raise CloudinaryError(
            "Cloudinary credentials not configured. "
            "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,  # Always use HTTPS
    )


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

    # Get file size by seeking to end
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning

    if file_size == 0:
        return {"valid": False, "error": "File is empty"}

    # Check file size on disk
    max_size_mb = current_app.config.get("MAX_IMAGE_SIZE_MB", 5)
    max_size_bytes = max_size_mb * 1024 * 1024

    if file_size > max_size_bytes:
        return {"valid": False, "error": f"File too large. Maximum size is {max_size_mb}MB"}

    # Verify actual image content using PIL (or magic bytes fallback)
    file_data = file.read()
    file.seek(0)  # Reset for later upload

    try:
        from io import BytesIO as _BytesIO

        from PIL import Image as PILImage

        img = PILImage.open(_BytesIO(file_data))
        img.verify()  # Verify it's a real image

        # Re-open to read dimensions (verify() invalidates the object)
        img = PILImage.open(_BytesIO(file_data))
        # Removed the uncompressed size check as it was too restrictive.
        # The compressed file size check above is sufficient for validation.
    except ImportError:
        # PIL not available, fall back to magic bytes check
        image_signatures = [
            b"\xff\xd8\xff",  # JPEG
            b"\x89PNG\r\n\x1a\n",  # PNG
            b"GIF87a",
            b"GIF89a",  # GIF
            b"RIFF",  # WebP (RIFF....WEBP)
        ]
        if not any(file_data[:16].startswith(sig) for sig in image_signatures):
            return {"valid": False, "error": "Invalid file type. File is not a valid image"}
    except Exception:
        return {"valid": False, "error": "Invalid file type. File is not a valid image"}

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
        # If Cloudinary is not configured, allow a development fallback to
        # return a dummy image URL so local testing can proceed without
        # requiring real credentials. This fallback is ONLY used when the
        # application is running in development mode.
        try:
            configure_cloudinary()
            cloudinary_configured = True
        except CloudinaryError:
            cloudinary_configured = False

        if not cloudinary_configured:
            # Development fallback: return a public sample image hosted by Cloudinary
            # so the UI can proceed. Do NOT use this in production.
            if (
                getattr(current_app, "config", {}).get(
                    "ENV", current_app.config.get("FLASK_ENV", "development")
                )
                == "development"
            ):
                sample_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                return {"success": True, "url": sample_url, "public_id": None}
            else:
                raise CloudinaryError("Cloudinary credentials not configured")

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
            # Let Cloudinary handle format optimization
            allowed_formats=["jpg", "jpeg", "png", "gif", "webp"],
        )

        return {"success": True, "url": result["secure_url"], "public_id": result["public_id"]}

    except CloudinaryError as e:
        current_app.logger.error(f"Cloudinary config error: {e}")
        return {"success": False, "error": str(e)}

    except cloudinary.exceptions.Error as e:
        current_app.logger.error(f"Cloudinary upload error: {e}")
        return {"success": False, "error": "Image upload failed. Please try again."}

    except Exception as e:
        current_app.logger.error(f"Unexpected upload error: {e}")
        return {"success": False, "error": "An unexpected error occurred during upload."}
