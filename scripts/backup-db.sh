#!/bin/bash

# SafeLayer BNB - Database Backup Script
# Backs up PostgreSQL database

set -e

DB_USER=${DB_USER:-"safelayer"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"safelayer_bnb"}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"

echo "🔄 Backing up database..."
echo "Database: $DB_NAME"
echo "Output: $BACKUP_FILE"
echo ""

# Perform backup
pg_dump -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "✓ Backup complete!"
echo "  Size: $FILE_SIZE"
echo "  Location: $BACKUP_FILE"
