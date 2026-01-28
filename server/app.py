from flask import Flask
from config import Config
from extensions import db, migrate

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
    app.register_blueprint(messages.bp)

    return app