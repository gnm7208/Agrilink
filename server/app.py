from flask import Flask,session, g
from config import Config
from extensions import db, migrate
from models import User




def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    
    # Import all model classes AFTER db.init_app
    from models import (
        Role, User, Community, CommunityMembership, 
        Post, PostImage, Like, Comment, Follow, Message
    )
    
    migrate.init_app(app, db)

    from routes import auth, users, posts, communities, messages
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(posts.bp)
    app.register_blueprint(communities.bp)
    @app.before_request
    def load_current_user():
        user_id = session.get("user_id")
        if user_id is not None:
            g.current_user = User.query.get(user_id)
        else:
            g.current_user = None

    app.register_blueprint(messages.bp)

    return app

