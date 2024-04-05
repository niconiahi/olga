CREATE TABLE user (
    id TEXT NOT NULL PRIMARY KEY,
    sub TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
