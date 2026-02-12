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

# 2️⃣ Check DB connectivity (TCP + password)
if PGPASSWORD='postgres' psql -h localhost -U postgres -d postgres -c '\q' 2>> "$LOG_FILE"; then
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
FREE_SPACE=$(df -m "$BACKUP_DIR" | awk 'NR==2 {print $4}')

if [ "$FREE_SPACE" -lt "$MIN_DISK_FREE_MB" ]; then
    echo "ERROR: Low disk space! Only ${FREE_SPACE}MB available." | tee -a "$LOG_FILE"
    exit 1
else
    echo "Disk space OK: ${FREE_SPACE}MB available." >> "$LOG_FILE"
fi

# 5️⃣ Check backup directory writable
if [ -w "$BACKUP_DIR" ]; then
    echo "Backup directory is writable." >> "$LOG_FILE"
else
    echo "ERROR: Backup directory is NOT writable!" | tee -a "$LOG_FILE"
    exit 1
fi

echo "Health Check PASSED." >> "$LOG_FILE"
exit 0
