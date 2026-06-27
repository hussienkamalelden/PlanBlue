-- PlanBlue local PostgreSQL bootstrap
-- Runs once on first container start via docker-entrypoint-initdb.d

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: separate schema for Strapi (Strapi uses public by default)
-- CREATE SCHEMA IF NOT EXISTS strapi;
