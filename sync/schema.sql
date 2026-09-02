CREATE TABLE IF NOT EXISTS saves (
  username TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
