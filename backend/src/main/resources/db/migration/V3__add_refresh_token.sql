-- ============================================================
-- V2__add_refresh_token.sql
-- Add refresh_tokens table
-- ============================================================

CREATE TABLE refresh_tokens (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID             NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token        VARCHAR(500)     NOT NULL UNIQUE,
    expiry_date  TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token   ON refresh_tokens(token);
