-- V3: Manager notes per client

CREATE TABLE manager_notes (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id  BIGINT    NOT NULL REFERENCES users(id),
    note        TEXT      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_manager_notes_user ON manager_notes(user_id);
