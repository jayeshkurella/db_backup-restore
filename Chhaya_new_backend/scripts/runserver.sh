#!/bin/bash

# Activate virtual environment
echo "Activating virtual environment..."
source /var/lib/jenkins/workspace/chhaya_jenkins/Chhaya_new_backend/venv/bin/activate

# Check if the virtual environment was activated successfully
if [ $? -eq 0 ]; then
  echo "Virtual environment activated successfully."
else
  echo "Failed to activate the virtual environment. Exiting..."
  exit 1
fi

# Change to the project directory (optional, but it's a good practice)
cd /var/lib/jenkins/workspace/chhaya_jenkins/Chhaya_new_backend

# Run Django development server 
echo "Starting the Django development server..."
python manage.py runserver 0.0.0.0:8090
