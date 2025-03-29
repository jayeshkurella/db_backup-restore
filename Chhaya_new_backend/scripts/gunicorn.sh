#!/bin/bash

project_directory="/var/lib/jenkins/workspace/chhaya-foundations"
#project_log_directory="/home/administrator/var/lib/jenkins/workspace/chhaya-foundations/logs"

echo "Changing directory to project workspace directory"
cd $project_directory

echo "Validate the present working directory"
pwd

# Check if gunicorn.service file exists in /etc/systemd/system
if [ -f /etc/systemd/system/chhaya.service ]; then
    echo "gunicorn.service already exists in /etc/systemd/system. Restarting the service..."
else
    echo "gunicorn.service not found. Copying the service file..."
    sudo cp Chhaya_new_backend/scripts/chhaya.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl start chhaya.service
    sudo systemctl enable chhaya.service
    echo "Gunicorn has been started and enabled."
fi

# Restart and check the status of the gunicorn service
sudo systemctl restart chhaya.service
sudo systemctl status chhaya.service

# Create /var/log/chhaya directory, set permissions, and create log files
log_directory="/var/log/chhaya"
if [ -d "$log_directory" ]; then
    echo "Log directory $log_directory is present."
else
    echo "Log directory $log_directory not found. Creating the directory..."
    sudo mkdir -p $log_directory
    sudo chown $USER:$USER $log_directory
    touch $log_directory/error.log $log_directory/access.log
    echo "Log directory and files have been created at $log_directory."
fi
