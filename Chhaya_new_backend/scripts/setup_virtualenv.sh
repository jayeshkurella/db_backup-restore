#!/bin/bash

project_directory="/var/lib/jenkins/workspace/chhaya-foundations"


echo "Changing directory to project workspace directory"
cd $project_directory

echo "Validate the present working directory"
pwd

if [ -d "venv" ] 
then
    echo "Python virtual environment exists." 
else
    python3 -m venv venv
fi

echo "Activating the virtual environment!"
source venv/bin/activate

echo "Checking if virtual environment is active after activation"
if [ -z "$VIRTUAL_ENV" ]; then
  echo "No virtual environment is active."
else
  echo "Virtual environment is active: $VIRTUAL_ENV"
fi

echo "Installing Python dependencies!"
pip install -r Chhaya_new_backend/requirement.txt

echo "Deactivating the virtual environment"
deactivate

echo "Checking if virtual environment is active after deactivation"
if [ -z "$VIRTUAL_ENV" ]; then
  echo "No virtual environment is active."
else
  echo "Virtual environment is active: $VIRTUAL_ENV"
fi
