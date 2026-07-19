from flask import Blueprint, jsonify, request

from data.crop_issues import diagnose, get_crops, get_symptoms
from extensions import limiter
from rbac import login_required

bp = Blueprint("crop_helper", __name__)

DEFAULT_RATE_LIMIT = "30 per minute"
VALID_SYMPTOM_IDS = {s["id"] for s in get_symptoms()}
VALID_CROPS = set(get_crops())


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "crop helper service running"})


@bp.get("/symptoms")
@limiter.limit(DEFAULT_RATE_LIMIT)
def symptoms():
    """Fixed crop list + symptom checklist for building the picker UI."""
    return jsonify({"crops": get_crops(), "symptoms": get_symptoms()})


@bp.post("/diagnose")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def diagnose_route():
    """
    Quick rule-based symptom checker — NOT real image analysis or AI
    diagnosis. Matches selected crop/symptoms against a curated knowledge
    base by tag overlap.
    """
    data = request.get_json() or {}
    crop = data.get("crop", "").strip()
    symptom_ids = data.get("symptoms") or []

    if crop not in VALID_CROPS:
        return jsonify({"error": f"crop must be one of {sorted(VALID_CROPS)}"}), 400
    if not isinstance(symptom_ids, list) or not symptom_ids:
        return jsonify({"error": "symptoms must be a non-empty list"}), 400

    invalid = set(symptom_ids) - VALID_SYMPTOM_IDS
    if invalid:
        return jsonify({"error": f"unknown symptom(s): {sorted(invalid)}"}), 400

    matches = diagnose(crop, symptom_ids)
    return jsonify({"matches": matches, "no_match": len(matches) == 0})
