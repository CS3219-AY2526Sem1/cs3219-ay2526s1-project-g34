#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER app WITH PASSWORD 'dev' CREATEDB;
    CREATE DATABASE database_development OWNER app;
    
    CREATE USER app_test WITH PASSWORD 'test' CREATEDB;
    CREATE DATABASE database_test OWNER test;
EOSQL