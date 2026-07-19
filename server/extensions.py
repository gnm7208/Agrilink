from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_talisman import Talisman

db = SQLAlchemy()
migrate = Migrate()
# CORS, Limiter, and Talisman are initialized in create_app() with app context
cors = CORS()
limiter = Limiter(key_func=get_remote_address)
talisman = Talisman()
