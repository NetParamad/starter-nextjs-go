DROP TRIGGER IF EXISTS trigger_set_users_updated_at ON users;
DROP FUNCTION IF EXISTS set_updated_at_timestamp();
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS user_role;
