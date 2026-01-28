"""
Seed default roles for AgriLink.

Usage (from Agrilink/server):
  flask --app app:create_app shell
  >>> from seed_roles import seed_default_roles
  >>> seed_default_roles()
"""

from extensions import db
from models import Role


def seed_default_roles() -> None:
    for role_name in ("user", "admin"):
        exists = Role.query.filter_by(name=role_name).first()
        if exists is None:
            db.session.add(Role(name=role_name))
    db.session.commit()

