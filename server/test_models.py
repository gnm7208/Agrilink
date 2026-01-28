from app import create_app
from extensions import db

app = create_app()
with app.app_context():
    print("Tables detected:")
    print(list(db.metadata.tables.keys()))
