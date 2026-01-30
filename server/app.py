import logging
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import Config
from extensions import db, migrate, cors, limiter


def create_app(config_class=Config):
    """
    Application factory for AgriLink backend.
    
    Initializes Flask app with database, migrations, CORS, and rate limiting.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # CORS configuration - allow configurable frontend origins
    # In production, avoid using '*' - specify exact origins
    frontend_origins = app.config.get('FRONTEND_ORIGINS', '*')
    cors.init_app(app, resources={r"/api/*": {"origins": frontend_origins}})
    
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

    # Request preprocessing - load authenticated user
    @app.before_request
    def load_current_user():
        """Load authenticated user from session into g.current_user."""
        from flask import session, g
        user_id = session.get("user_id")
        if user_id is not None:
            g.current_user = User.query.get(user_id)
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
    app = create_app()
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    logger.info(f"Starting AgriLink backend on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

