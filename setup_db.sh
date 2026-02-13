#!/bin/bash

# Create PostgreSQL user and database for Agrilink
sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS agrilink;
DROP USER IF EXISTS agrilink;

-- Create user
CREATE USER agrilink WITH PASSWORD 'agrilink_dev_password';

-- Create database
CREATE DATABASE agrilink OWNER agrilink;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agrilink TO agrilink;

\c agrilink
GRANT ALL ON SCHEMA public TO agrilink;

\q
EOF

echo "Database setup complete!"
