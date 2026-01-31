import logging
import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, session, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import get_config
from extensions import db, migrate, cors, limiter


def create_app(config_name=None):
    """
    Application factory for AgriLink backend.

    Initializes Flask app with database, migrations, CORS, and rate limiting.
    Args:
        config_name: Configuration environment name (development, production, testing)
    """
    app = Flask(__name__)

    # Load and validate configuration
    config_class = get_config(config_name)
    app.config.from_object(config_class)
    config_class.validate()  # Validate configuration at startup

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # CORS configuration with security considerations
    # Parse comma-separated origins from config
    frontend_origins = app.config.get('FRONTEND_ORIGINS', '')
    if frontend_origins:
        origins_list = [origin.strip() for origin in frontend_origins.split(',')]
    else:
        origins_list = []

    cors.init_app(
        app,
        resources={r"/api/*": {
            "origins": origins_list,
            "supports_credentials": True,  # Required for session cookies
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }}
    )

    # Rate limiter configuration
    limiter.init_app(app)

    # Import all model classes AFTER db.init_app
    from models import (
        Role, User, Community, CommunityMembership, 
        Post, PostImage, Like, Comment, Follow, Message
    )

    # Register blueprints
    from routes import auth, users, posts, communities, messages
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(posts.bp, url_prefix='/api/posts')
    app.register_blueprint(communities.bp, url_prefix='/api/communities')
    app.register_blueprint(messages.bp, url_prefix='/api/messages')

    # Request preprocessing - load authenticated user with session security
    @app.before_request
    def load_current_user():
        """
        Load authenticated user from session into g.current_user.
        Implements session timeout and validates user still exists.
        """
        user_id = session.get("user_id")
        session_created = session.get("session_created_at")

        # Check session timeout (24 hours)
        if session_created and user_id:
            try:
                created_time = datetime.fromisoformat(session_created)
                session_age = datetime.utcnow() - created_time
                max_age = timedelta(seconds=app.config.get('PERMANENT_SESSION_LIFETIME', 86400))

                if session_age > max_age:
                    # Session expired
                    session.clear()
                    g.current_user = None
                    app.logger.info(f"Session expired for user_id={user_id}")
                    return
            except (ValueError, TypeError) as e:
                app.logger.warning(f"Invalid session timestamp: {e}")
                session.clear()
                g.current_user = None
                return

        # Load user if session is valid
        if user_id is not None:
            user = User.query.get(user_id)
            if user is None:
                # User was deleted, clear session
                session.clear()
                g.current_user = None
                app.logger.warning(f"Session user_id={user_id} no longer exists")
            else:
                g.current_user = user
        else:
            g.current_user = None

    # Structured error handlers for consistent API responses
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


# Basic production-safe logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(config_name=env)
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # Security warnings
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

