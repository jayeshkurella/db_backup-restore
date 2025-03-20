#!/bin/bash

# Setup PostgreSQL Database
echo "Setting up PostgreSQL database..."

sudo -u postgres psql <<EOF
DO $$ 
BEGIN 
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chhaya_demo') THEN
      CREATE DATABASE chhaya_demo;
   END IF;
END $$;

DO $$ 
BEGIN 
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
      CREATE USER postgres WITH PASSWORD 'postgres';
   END IF;
END $$;

GRANT ALL PRIVILEGES ON DATABASE chhaya_demo TO postgres;
EOF

echo "Database setup completed."
