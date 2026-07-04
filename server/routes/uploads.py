"""
Image upload routes for AgriLink.

Provides endpoints for uploading images to Cloudinary.
"""

from flask import Blueprint, jsonify, request

from cloudinary_utils import upload_image, validate_image_file
from extensions import limiter
from rbac import login_required

bp = Blueprint("uploads", __name__, url_prefix="/uploads")

# Rate limit for uploads - prevent abuse
UPLOAD_RATE_LIMIT = "10 per minute"


@bp.route("/health", methods=["GET"])
def health():
    """Health check for uploads service."""
    return jsonify({"status": "uploads service running"})


@bp.post("/images")
@login_required
@limiter.limit(UPLOAD_RATE_LIMIT)
def upload_image_endpoint():
    """
    Upload a single image to Cloudinary.

    Accepts multipart/form-data with a single image file.
    The image field should be named 'image' or 'file'.

    Request:
        Content-Type: multipart/form-data
        Body: image file (field name: 'image' or 'file')

    Returns:
        201: {"url": "https://res.cloudinary.com/..."}
        400: {"error": "...", "message": "..."}
        401: Unauthorized (not logged in)
        413: File too large
        500: Upload failed

    Rate Limit: 10 uploads per minute per user
    """
    # Check for file in request
    # Accept either 'image' or 'file' field name
    file = request.files.get("image") or request.files.get("file")

    if not file:
        return jsonify(
            {
                "error": "No file provided",
                "message": "Please include an image file with field name 'image' or 'file'",
            }
        ), 400

    # Validate the file
    validation = validate_image_file(file)
    if not validation["valid"]:
        return jsonify({"error": validation["error"], "message": validation["error"]}), 400

    # Upload to Cloudinary
    result = upload_image(file)

    if not result["success"]:
        return jsonify({"error": "Upload failed", "message": result["error"]}), 500

    return jsonify({"url": result["url"]}), 201
