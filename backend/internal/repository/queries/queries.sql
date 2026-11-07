-- name: CreateUser :one
INSERT INTO users (username, email, password_hash, full_name, status)
VALUES ($1, $2, $3, $4, 'active')
RETURNING id, username, email, full_name, role, status, last_login_at, created_at, updated_at, deleted_at, password_hash;

-- name: GetUserByEmail :one
SELECT id, username, email, full_name, role, status, last_login_at, created_at, updated_at, deleted_at, password_hash
FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- name: GetUserByID :one
SELECT id, username, email, full_name, role, status, last_login_at, created_at, updated_at, deleted_at, password_hash
FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: SoftDeleteUser :exec
UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateUserLastLogin :exec
UPDATE users SET last_login_at = $2, updated_at = $2 WHERE id = $1;

-- name: UpdateUserPasswordHash :exec
UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1;

-- name: CreateRefreshToken :exec
INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, '')::inet, $5);

-- name: GetActiveRefreshTokenByHash :one
SELECT id, user_id, refresh_token_hash, expires_at, revoked_at, created_at
FROM user_sessions
WHERE refresh_token_hash = $1
  AND revoked_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

-- name: MarkRefreshTokenRevoked :exec
UPDATE user_sessions
SET revoked_at = $2
WHERE id = $1;

-- name: DeleteRefreshTokensByUserID :exec
DELETE FROM user_sessions
WHERE user_id = $1;
