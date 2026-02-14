#!/usr/bin/env bash
# Render build script for AgriLink backend
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Seed default roles (user, admin)
python -c "from app import create_app; from seed_roles import seed_default_roles; app = create_app('production'); app.app_context().push(); seed_default_roles()"
