-- PostgreSQL initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional database for testing if needed
-- CREATE DATABASE tcg_mobile_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE tcg_mobile TO tcg_user;

-- Enable extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
SELECT 'PostgreSQL database initialized successfully' AS status;
