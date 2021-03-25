INSERT INTO users (name, email, hash, admin)
VALUES ($1, $2, $3, $4)
returning id, name, email, admin;

-- not returning * because we don't want the hash returned