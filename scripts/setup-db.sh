#!/bin/bash

# SafeLayer BNB - Database Setup Script
# Creates PostgreSQL database and runs migrations

set -e

echo "📊 SafeLayer BNB Database Setup"
echo "=================================="

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client is not installed"
    echo "Install with: brew install postgresql (macOS) or apt-get install postgresql-client (Linux)"
    exit 1
fi

# Database configuration
DB_USER=${DB_USER:-"safelayer"}
DB_PASSWORD=${DB_PASSWORD:-"safelayer_password"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"safelayer_bnb"}

echo "Creating database..."
echo "User: $DB_USER"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Create superuser and database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U postgres -p $DB_PORT << EOF
-- Create user if not exists
DO
\$do\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$do\$;

-- Grant privileges
ALTER USER $DB_USER SUPERUSER;

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Connect to database and create extensions
\c $DB_NAME;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

echo "✓ Database and user created"

# Run migrations
if [ -d "migrations" ]; then
    echo ""
    echo "Running migrations..."
    
    for migration in migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "  Applying: $(basename $migration)"
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT < "$migration"
        fi
    done
    echo "✓ Migrations completed"
else
    echo "No migrations directory found, skipping..."
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection string:"
echo "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
