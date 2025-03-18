#!/usr/bin/env bash

# Variables
PYTHON_VERSION="python3"
VENV_DIR="venv"

# Update package list
echo "Updating package list..."
sudo apt update -y || { echo "Failed to update package list"; exit 1; }

# Install Python and virtual environment tools
echo "Installing Python and virtual environment tools..."
sudo apt install -y $PYTHON_VERSION $PYTHON_VERSION-venv $PYTHON_VERSION-pip
if [ $? -ne 0 ]; then
    echo "Failed to install Python and virtual environment tools"
    exit 1
fi

# Create virtual environment
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists. Skipping creation."
else
    echo "Creating virtual environment..."
    $PYTHON_VERSION -m venv $VENV_DIR
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source $VENV_DIR/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment"
    exit 1
fi

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
if [ $? -ne 0 ]; then
    echo "Failed to upgrade pip"
    exit 1
fi

echo "Python environment setup is complete!"
echo "Run 'source $VENV_DIR/bin/activate' to activate the virtual environment."
