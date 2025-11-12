# AI Assistance Disclosure:
# Tool: GitHub Copilot (Claude Sonnet 4.5)
# Date: 2025-11-07
# Scope: Assisted in generating boilerplate Bash script for PostgreSQL database initialization, 
# including creation of users, development and test databases, and schema setup for "Users" 
# and "Questions" tables. Suggested structure for SQL execution blocks and safe error handling 
# using `set -e` and `ON_ERROR_STOP`.
# Author review: I validated all SQL commands, ensured schema definitions, indexes, and user 
# privileges align with project requirements, and verified that system architecture and 
# database schema design were independently determined by the team prior to AI assistance.

#!/bin/bash
set -e

echo "Starting database initialization..."

# Create databases and users
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER app WITH PASSWORD 'dev' CREATEDB;
    CREATE DATABASE database_development OWNER app;
    
    CREATE USER app_test WITH PASSWORD 'test' CREATEDB;
    CREATE DATABASE database_test OWNER app_test;
EOSQL

echo "Databases created. Creating tables..."

# Create tables in development database
psql -v ON_ERROR_STOP=1 --username "app" --dbname "database_development" <<-EOSQL
    -- Create Users table
    CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Questions table
    CREATE TABLE IF NOT EXISTS "Questions" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        topics TEXT[],
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON "Users"(username);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON "Questions"(difficulty);
    CREATE INDEX IF NOT EXISTS idx_questions_topics ON "Questions" USING GIN(topics);
EOSQL

echo "✅ Database initialization completed successfully!"