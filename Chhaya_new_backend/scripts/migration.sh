#!/bin/bash

echo "Activating the virtual environment..."
source /var/lib/jenkins/workspace/chhaya_test/venv/bin/activate

if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "Virtual environment is active: $VIRTUAL_ENV"
else
    echo "Failed to activate the virtual environment. Exiting..."
    exit 1
fi

echo "Installing dependencies..."
pip install -r /var/lib/jenkins/workspace/chhaya_test/Chhaya_new_backend/requirement.txt

#echo "Processing for makemigrations..."
#python /var/lib/jenkins/workspace/chhaya_test/Chhaya_new_backend/manage.py makemigrations

echo "Processing for migrations..."
python /var/lib/jenkins/workspace/chhaya_test/Chhaya_new_backend/manage.py migrate

echo "Migrations Done"

echo "Deactivating the virtual environment..."
deactivate
