#!/bin/bash

#############################################
# PostgreSQL Full Backup Script for Jenkins
# Author: DevOps Backup Automation
#############################################

# === CONFIGURATION ===
BACKUP_DIR="/var/lib/jenkins/workspace/backup/Local-DB-Backups"
LOG_FILE="/var/lib/jenkins/workspace/backup/scripts/backup_log.txt"
DB_USER="postgres"
DB_PASSWORD="postgres"          # your PostgreSQL password
DB_HOST="localhost"
DATE=$(date +"%Y%m%d%H%M%S")

# Export password for non-interactive authentication
export PGPASSWORD="$DB_PASSWORD"

#############################################

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "======================================" >> "$LOG_FILE"
echo "Backup Started at: $(date)" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"

# Test PostgreSQL connection
if ! psql -U "$DB_USER" -h "$DB_HOST" -d postgres -c '\q' 2>> "$LOG_FILE"; then
    echo "ERROR: Cannot connect to PostgreSQL!" | tee -a "$LOG_FILE"
    exit 1
fi

# Get all non-template databases
DB_LIST=$(psql -U "$DB_USER" -h "$DB_HOST" -d postgres -t -c \
"SELECT datname FROM pg_database WHERE datistemplate = false;" 2>> "$LOG_FILE")

if [ -z "$DB_LIST" ]; then
    echo "ERROR: No databases found!" | tee -a "$LOG_FILE"
    exit 1
fi

# Loop through each database
for DB_NAME in $DB_LIST; do

    DB_NAME=$(echo "$DB_NAME" | xargs)  # Trim spaces

    DB_BACKUP_DIR="$BACKUP_DIR/$DB_NAME"
    mkdir -p "$DB_BACKUP_DIR"

    FILE_NAME="${DB_NAME}-${DATE}.sql"
    FULL_PATH="$DB_BACKUP_DIR/$FILE_NAME"

    echo "Backing up database: $DB_NAME" | tee -a "$LOG_FILE"

    if pg_dump -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" > "$FULL_PATH" 2>> "$LOG_FILE"; then
        
        gzip "$FULL_PATH"

        if [ $? -eq 0 ]; then
            echo "Backup successful: ${DB_NAME}" | tee -a "$LOG_FILE"
        else
            echo "ERROR: Compression failed for ${DB_NAME}" | tee -a "$LOG_FILE"
            exit 1
        fi

    else
        echo "ERROR: Backup failed for ${DB_NAME}" | tee -a "$LOG_FILE"
        exit 1
    fi

done

echo "======================================" >> "$LOG_FILE"
echo "Backup Completed at: $(date)" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"

exit 0
