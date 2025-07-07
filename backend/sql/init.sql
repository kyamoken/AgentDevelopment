-- Initial database setup for realtime chat application
-- This file is used by Docker to initialize the PostgreSQL database

-- Create the database if it doesn't exist (handled by POSTGRES_DB env var)
-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: TypeORM will handle table creation through synchronize or migrations
-- This file is mainly for database initialization and extensions