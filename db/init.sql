CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS resources (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS resource_details (
    id              SERIAL PRIMARY KEY,
    resource_id     INTEGER     NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    link            TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_details_resource_id ON resource_details(resource_id);
