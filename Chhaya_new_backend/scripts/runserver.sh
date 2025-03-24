#!/bin/bash

echo "Activating virtual environment..."
source /var/lib/jenkins/workspace/chhaya_tets/venv/bin/activate

if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "Virtual environment activated."
else
    echo "Failed to activate the virtual environment. Exiting..."
    exit 1
fi

echo "Starting Django server..."
cd /var/lib/jenkins/workspace/chhaya_test/Chhaya_new_backend
python manage.py runserver 0.0.0.0:8000
