DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'contract_db_test') THEN
      CREATE DATABASE contract_db_test;
   END IF;
END
$$;

DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'contract_user_test') THEN
      CREATE USER contract_user_test WITH PASSWORD 'password_test';
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE contract_db_test TO contract_user_test;
ALTER USER contract_user_test WITH CREATEDB;
GRANT ALL ON SCHEMA public TO contract_user_test;
GRANT ALL ON ALL TABLES IN SCHEMA public TO contract_user_test;
