from flask import Flask
from config import Config
from extensions import db, migrate
from models import *

def create_app():
    app = Flask(_name_)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    
    from routes import auth, users, posts, communities, messages
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(posts.bp)
    app.register_blueprint(communities.bp)
    app.register_blueprint(messages.bp)

    return app