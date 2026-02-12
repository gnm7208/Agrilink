import logging
import os
from datetime import datetime, timedelta

from flask import Flask, jsonify, session, g
from dotenv import load_dotenv


load_dotenv("/home/maish/Agrilink/server/.env", override=True)

from config import get_config
from extensions import db, migrate, cors, limiter


def create_app(config_name=None):
    app = Flask(__name__)

    
    config_class = get_config(config_name)
    app.config.from_object(config_class)
    config_class.validate()

  
    frontend_origins = app.config.get("FRONTEND_ORIGINS", "")
    origins_list = [o.strip() for o in frontend_origins.split(",") if o.strip()]

    print("CORS allowed origins:", origins_list)

    cors.init_app(
        app,
        supports_credentials=True,
        origins=origins_list,
    )

    
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

  
    from models import User

    
    from routes import auth, users, posts, communities, messages, uploads

    app.register_blueprint(auth.bp, url_prefix="/api/auth")
    app.register_blueprint(users.bp, url_prefix="/api/users")
    app.register_blueprint(posts.bp, url_prefix="/api/posts")
    app.register_blueprint(communities.bp, url_prefix="/api/communities")
    app.register_blueprint(messages.bp, url_prefix="/api/messages")
    app.register_blueprint(uploads.bp, url_prefix="/api/uploads")

   
    @app.before_request
    def load_current_user():
        user_id = session.get("user_id")
        session_created = session.get("session_created_at")

        if user_id and session_created:
            try:
                created_time = datetime.fromisoformat(session_created)
                max_age = timedelta(
                    seconds=app.config.get("PERMANENT_SESSION_LIFETIME", 86400)
                )
                if datetime.utcnow() - created_time > max_age:
                    session.clear()
                    g.current_user = None
                    return
            except Exception:
                session.clear()
                g.current_user = None
                return

        g.current_user = User.query.get(user_id) if user_id else None

    
    @app.route("/health")
    def health():
        return jsonify({"status": "healthy"})

    return app


logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(env)

    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
