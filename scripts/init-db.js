/**
 * Run once on first deploy to create tables.
 * Usage: node scripts/init-db.js
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  "user_id" serial PRIMARY KEY NOT NULL,
  "username" varchar NOT NULL UNIQUE,
  "password" varchar NOT NULL,
  "email" varchar NOT NULL,
  "phone" varchar NOT NULL,
  "address" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  "isbn" varchar PRIMARY KEY NOT NULL,
  "title" varchar NOT NULL,
  "author" varchar NOT NULL,
  "genre" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS users_books (
  "users_books_id" serial PRIMARY KEY NOT NULL,
  "requester" bigint REFERENCES users,
  "user_id" integer NOT NULL REFERENCES users,
  "bookisbn" varchar NOT NULL REFERENCES books,
  "condition" varchar NOT NULL,
  "accepted" boolean DEFAULT false
);

INSERT INTO users ("username", "password", "email", "phone", "address")
VALUES ('admin', '$2b$12$kaE6SnaSGjH3xeRJkrdGUepWRmP/A119KJRsWsKE8.ZEzgEiB0hXO', 'admin@bookexchange.com', '000-000-0000', '00000')
ON CONFLICT (username) DO NOTHING;
`;

pool.query(sql)
  .then(() => { console.log('Database initialized.'); process.exit(0); })
  .catch(err => { console.error('Init failed:', err.message); process.exit(1); });
