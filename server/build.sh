#!/usr/bin/env bash
# Render build script for AgriLink backend
set -o errexit

echo "=== Build Environment ==="
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "FLASK_APP: $FLASK_APP"
echo "FLASK_ENV: $FLASK_ENV"

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations with explicit app context
python -c "
from app import create_app
from flask_migrate import upgrade

app = create_app('production')
with app.app_context():
    upgrade()
"

# Seed default roles (user, admin)
python -c "from app import create_app; from seed_roles import seed_default_roles; app = create_app('production'); app.app_context().push(); seed_default_roles()"

echo "=== Build completed successfully ==="
