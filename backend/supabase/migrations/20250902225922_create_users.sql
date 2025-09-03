CREATE TABLE users (
    id UUID primary key default gen_random_uuid(),
    name varchar(200)
);