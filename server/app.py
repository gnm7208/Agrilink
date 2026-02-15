import logging
import os
import sys
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, session, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

# Add server directory to path for imports to work
_server_dir = os.path.dirname(os.path.abspath(__file__))
if _server_dir not in sys.path:
    sys.path.insert(0, _server_dir)

from config import get_config
from extensions import db, migrate, cors, limiter

DEFAULT_RATE_LIMIT = "100 per hour"  # Adjust as needed



def create_app(config_name=None):
    """
    Application factory for AgriLink backend.
    """
    app = Flask(__name__)

    # Load configuration
    config_class = get_config(config_name)
    app.config.from_object(config_class)
    config_class.validate()  # Validate required settings
    

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # CORS configuration
    frontend_origins = app.config.get("FRONTEND_ORIGINS", "")
    origins_list = [o.strip() for o in frontend_origins.split(",")] if frontend_origins else []
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": origins_list, "supports_credentials": True}}
    )

    # Rate limiter
    # Rate limiter
    limiter.init_app(app)

    # Import models AFTER db.init_app
    from models import Role, User, Community, CommunityMembership, Post, PostImage, Like, Comment, Follow, Message

    # Import blueprints
    from routes import auth, users, posts, communities, messages, uploads

    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix="/api/auth")
    app.register_blueprint(users.bp, url_prefix="/api/users")
    app.register_blueprint(posts.bp, url_prefix="/api/posts")
    app.register_blueprint(communities.bp, url_prefix="/api/communities")
    app.register_blueprint(messages.bp, url_prefix="/api/messages")
    app.register_blueprint(uploads.bp, url_prefix="/api/uploads")

    @app.before_request
    def load_current_user():
        """Load authenticated user from JWT token or session into g.current_user."""
        from jwt_utils import decode_token

        # 1. Try JWT token from Authorization header first
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = decode_token(token)
            if payload and "user_id" in payload:
                g.current_user = User.query.get(payload["user_id"])
                return
            # Invalid/expired token — fall through to session check

        # 2. Fall back to session-based auth (local dev)
        user_id = session.get("user_id")
        session_created = session.get("session_created_at")

        if session_created and user_id:
            try:
                created_time = datetime.fromisoformat(session_created)
                session_age = datetime.utcnow() - created_time
                max_age = timedelta(seconds=app.config.get("PERMANENT_SESSION_LIFETIME", 86400))

                if session_age > max_age:
                    session.clear()
                    g.current_user = None
                    app.logger.info(f"Session expired for user_id={user_id}")
                    return
            except (ValueError, TypeError) as e:
                session.clear()
                g.current_user = None
                app.logger.warning(f"Invalid session timestamp: {e}")
                return

        g.current_user = User.query.get(user_id) if user_id else None
        

    # Structured error handlers
    # Structured error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "message": str(error.description)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": "Access denied"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error", "message": "An unexpected error occurred"}), 500

    # Root health check
    @app.route("/health")
    def health():
        return jsonify({"status": "healthy", "service": "agrilink-backend"})

    return app


# Logging configuration
# Configure basic logging for the application
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(config_name=env)
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    if debug:
        logger.warning("=" * 60)
        logger.warning("WARNING: Running in DEBUG mode!")
        logger.warning("Never use DEBUG=True in production!")
        logger.warning("=" * 60)

    if env == "production" and host == "0.0.0.0":
        logger.warning("Running production server directly is not recommended.")
        logger.warning("Use a production WSGI server like gunicorn or uwsgi.")

    logger.info(f"Starting AgriLink backend [{env}] on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
