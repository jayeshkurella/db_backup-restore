#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Update system packages
echo "Updating system packages..."
sudo apt update

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Set up Python environment
echo "Installing Python virtual environment..."
sudo apt install -y python3-venv python3-pip
pip3 install virtualenv

# Create and activate virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install project dependencies
echo "Installing required Python packages..."
pip install -r requirements.txt

# Setup PostgreSQL Database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
CREATE DATABASE your_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
ALTER USER your_user WITH SUPERUSER;
EOF

# Install GDAL
echo "Installing GDAL..."
sudo apt update
sudo apt-get install -y gdal-bin libgdal-dev
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal

# Install Django Redis cache support
echo "Installing Django Redis support..."
pip install django-redis

# Enable PostGIS extension
echo "Enabling PostGIS extension..."
sudo -u postgres psql -d your_db -c "CREATE EXTENSION postgis;"

# Apply Django migrations
echo "Applying Django migrations..."
python manage.py makemigrations
python manage.py migrate

# Create Django superuser (optional, interactive)
echo "Creating Django superuser (Follow prompts)..."
python manage.py createsuperuser

# Start Django development server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000
