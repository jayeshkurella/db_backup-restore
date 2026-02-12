#!/bin/bash

FILE="$1"
LOG_FILE="/var/lib/jenkins/workspace/backup/checksum.log"

echo "==============================" >> "$LOG_FILE"
echo "Checksum Verification Started: $(date)" >> "$LOG_FILE"
echo "==============================" >> "$LOG_FILE"

# 1️⃣ Check file argument
if [ -z "$FILE" ]; then
    echo "ERROR: No file provided!" | tee -a "$LOG_FILE"
    exit 1
fi

# 2️⃣ Check file exists
if [ ! -f "$FILE" ]; then
    echo "ERROR: File does not exist: $FILE" | tee -a "$LOG_FILE"
    exit 1
fi

# 3️⃣ Generate checksum
CHECKSUM_FILE="${FILE}.sha256"

if sha256sum "$FILE" > "$CHECKSUM_FILE"; then
    echo "Checksum generated: $CHECKSUM_FILE" >> "$LOG_FILE"
else
    echo "ERROR: Failed to generate checksum." | tee -a "$LOG_FILE"
    exit 1
fi

# 4️⃣ Verify checksum
if sha256sum -c "$CHECKSUM_FILE" >> "$LOG_FILE" 2>&1; then
    echo "Checksum verification PASSED for $FILE" | tee -a "$LOG_FILE"
else
    echo "ERROR: Checksum verification FAILED for $FILE" | tee -a "$LOG_FILE"
    exit 1
fi

exit 0
