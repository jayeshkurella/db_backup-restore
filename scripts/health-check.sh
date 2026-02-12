#!/bin/bash

LOG_FILE="/var/lib/jenkins/workspace/backup/health_check.log"
BACKUP_DIR="/var/lib/jenkins/workspace/backup/Local-DB-Backups"
MIN_DISK_FREE_MB=500   # Minimum free space required

echo "==============================" >> "$LOG_FILE"
echo "Health Check Started: $(date)" >> "$LOG_FILE"
echo "==============================" >> "$LOG_FILE"

# 1️⃣ Check PostgreSQL service
if systemctl is-active --quiet postgresql; then
    echo "PostgreSQL service is running." >> "$LOG_FILE"
else
    echo "ERROR: PostgreSQL service is NOT running!" | tee -a "$LOG_FILE"
    exit 1
fi

# 2️⃣ Check DB connectivity (Force TCP connection)
if psql -h localhost -U postgres -d postgres -c '\q' 2>> "$LOG_FILE"; then
    echo "Database connectivity OK." >> "$LOG_FILE"
else
    echo "ERROR: Cannot connect to PostgreSQL!" | tee -a "$LOG_FILE"
    exit 1
fi

# 3️⃣ Check backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory does not exist. Creating it..." >> "$LOG_FILE"
    mkdir -p "$BACKUP_DIR" || {
        echo "ERROR: Cannot create backup directory!" | tee -a "$LOG_FILE"
        exit 1
    }
fi

# 4️⃣ Check disk space
FREE_SPACE=_
