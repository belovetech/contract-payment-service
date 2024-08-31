DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'contract_db') THEN
      CREATE DATABASE contract_db;
   END IF;
END
$$;

DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'contract_user') THEN
      CREATE USER contract_user WITH PASSWORD 'contract_password';
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE contract_db TO contract_user;
ALTER USER contract_user WITH CREATEDB;
GRANT ALL ON SCHEMA public TO contract_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO contract_user;
