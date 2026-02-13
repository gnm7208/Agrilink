"""
Seed default roles for AgriLink.
"""

from app import create_app
from extensions import db
from models import Role


def seed_default_roles() -> None:
    for role_name in ("user", "admin"):
        exists = Role.query.filter_by(name=role_name).first()
        if exists is None:
            db.session.add(Role(name=role_name))
    db.session.commit()
    print(f"Roles seeded: user, admin")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_default_roles()

