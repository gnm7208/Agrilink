from flask import Blueprint, g, jsonify, request

from extensions import db, limiter
from models import MarketPrice
from rbac import login_required

bp = Blueprint("market", __name__)

DEFAULT_RATE_LIMIT = "30 per minute"


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "market service running"})


@bp.get("")
@limiter.limit(DEFAULT_RATE_LIMIT)
def list_prices():
    """List market prices, newest first, filterable by crop/location."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    crop = request.args.get("crop", "").strip()
    location = request.args.get("location", "").strip()

    query = MarketPrice.query
    if crop:
        query = query.filter(MarketPrice.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(MarketPrice.location.ilike(f"%{location}%"))

    pagination = query.order_by(MarketPrice.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "prices": [p.to_dict() for p in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": per_page,
        }
    )


@bp.get("/crops")
@limiter.limit(DEFAULT_RATE_LIMIT)
def list_crops():
    """Distinct crop names already posted, for a filter dropdown."""
    rows = db.session.query(MarketPrice.crop).distinct().order_by(MarketPrice.crop).all()
    return jsonify({"crops": [r[0] for r in rows]})


@bp.post("")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def create_price():
    """Submit a local market price report."""
    data = request.get_json() or {}
    crop = data.get("crop", "").strip()
    price = data.get("price")
    unit = data.get("unit", "").strip()
    location = data.get("location", "").strip()
    notes = data.get("notes", "").strip() or None

    if not crop:
        return jsonify({"error": "crop is required"}), 400
    if not isinstance(price, (int, float)) or price <= 0:
        return jsonify({"error": "price must be a positive number"}), 400
    if not unit:
        return jsonify({"error": "unit is required"}), 400
    if not location:
        return jsonify({"error": "location is required"}), 400

    entry = MarketPrice(
        crop=crop,
        price=price,
        unit=unit,
        location=location,
        notes=notes,
        posted_by=g.current_user.id,
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


@bp.delete("/<int:price_id>")
@login_required
@limiter.limit(DEFAULT_RATE_LIMIT)
def delete_price(price_id):
    """Delete a price report. Own report only, or admin."""
    entry = MarketPrice.query.get_or_404(price_id)
    if entry.posted_by != g.current_user.id and not g.current_user.is_admin():
        return jsonify({"error": "Forbidden"}), 403
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Price report deleted"})
