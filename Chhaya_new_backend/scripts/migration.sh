#!/bin/bash

project_directory="/var/lib/jenkins/workspace/chhaya_new"

echo "Changing directory to Python project directory"
cd $project_directory
if [ $? -ne 0 ]; then
  echo "Failed to change directory to $project_directory"
  exit 1
fi

echo "Activating the virtual environment"
source venv/bin/activate

echo "Checking if virtual environment is active after activation"
if [ -z "$VIRTUAL_ENV" ]; then
  echo "Failed to activate virtual environment."
  exit 1
else
  echo "Virtual environment is active: $VIRTUAL_ENV"
fi

# Check if manage.py exists
if [ ! -f "$project_directory/Chhaya_new_backend/manage.py" ]; then
  echo "manage.py not found in $project_directory/Chhaya_new_backend"
  exit 1
fi

echo "Processing for makemigrations"
cd $project_directory/Chhaya_new_backend
python3 manage.py makemigrations --noinput

echo "Processing for migrations"
python3 manage.py migrate

echo "Migrations Done"

echo "Deactivating the virtual environment"
deactivate

echo "Checking if virtual environment is active after deactivation"
if [ -z "$VIRTUAL_ENV" ]; then
  echo "No virtual environment is active."
else
  echo "Virtual environment is still active: $VIRTUAL_ENV"
fi
