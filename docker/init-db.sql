-- DevPath - Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: pgvector extension for RAG (Phase 2)
-- Uncomment when ready to implement RAG
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE devpath TO devpath;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'DevPath database initialized successfully!';
END $$;
