/**
 * Run once on first deploy to create tables and seed dummy data.
 * Usage: node scripts/init-db.js
 */
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const SALT_ROUNDS = 10;

const users = [
  { username: 'admin',   password: 'admin123',   email: 'admin@bookexchange.com' },
  { username: 'ahmet',   password: 'ahmet123',   email: 'ahmet@example.com' },
  { username: 'elif',    password: 'elif123',    email: 'elif@example.com' },
  { username: 'mert',    password: 'mert123',    email: 'mert@example.com' },
  { username: 'zeynep',  password: 'zeynep123',  email: 'zeynep@example.com' },
  { username: 'burak',   password: 'burak123',   email: 'burak@example.com' },
  { username: 'selin',   password: 'selin123',   email: 'selin@example.com' },
  { username: 'emre',    password: 'emre123',    email: 'emre@example.com' },
  { username: 'ayse',    password: 'ayse123',    email: 'ayse@example.com' },
  { username: 'can',     password: 'can123',     email: 'can@example.com' },
  { username: 'naz',     password: 'naz123',     email: 'naz@example.com' },
];

const books = [
  { isbn: '9780061964961', title: 'Dune',                         author: 'Frank Herbert',        genre: 'Science Fiction' },
  { isbn: '9780743273565', title: 'The Great Gatsby',             author: 'F. Scott Fitzgerald',  genre: 'Classic' },
  { isbn: '9780062316097', title: 'The Alchemist',                author: 'Paulo Coelho',         genre: 'Fiction' },
  { isbn: '9780451524935', title: '1984',                         author: 'George Orwell',        genre: 'Dystopian' },
  { isbn: '9780316769174', title: 'The Catcher in the Rye',       author: 'J.D. Salinger',        genre: 'Classic' },
  { isbn: '9780140449136', title: 'Crime and Punishment',         author: 'Fyodor Dostoevsky',    genre: 'Classic' },
  { isbn: '9780525559474', title: 'The Midnight Library',         author: 'Matt Haig',            genre: 'Fiction' },
  { isbn: '9780385490818', title: 'Beloved',                      author: 'Toni Morrison',        genre: 'Fiction' },
  { isbn: '9780679720201', title: 'In Search of Lost Time',       author: 'Marcel Proust',        genre: 'Classic' },
  { isbn: '9780062409850', title: 'Sapiens',                      author: 'Yuval Noah Harari',    genre: 'Non-Fiction' },
  { isbn: '9780141439518', title: 'Pride and Prejudice',          author: 'Jane Austen',          genre: 'Classic' },
  { isbn: '9780544003415', title: 'The Lord of the Rings',        author: 'J.R.R. Tolkien',       genre: 'Fantasy' },
  { isbn: '9780156012195', title: 'The Little Prince',            author: 'Antoine de Saint-Exupéry', genre: 'Fiction' },
  { isbn: '9780143127741', title: 'Thinking, Fast and Slow',      author: 'Daniel Kahneman',      genre: 'Non-Fiction' },
  { isbn: '9780307588371', title: 'The Road',                     author: 'Cormac McCarthy',      genre: 'Fiction' },
  { isbn: '9780374533557', title: 'Madame Bovary',                author: 'Gustave Flaubert',     genre: 'Classic' },
  { isbn: '9780062315007', title: 'The Monk Who Sold His Ferrari', author: 'Robin Sharma',        genre: 'Self-Help' },
  { isbn: '9780593230527', title: 'Atomic Habits',                author: 'James Clear',          genre: 'Self-Help' },
  { isbn: '9780099590088', title: 'Brave New World',              author: 'Aldous Huxley',        genre: 'Dystopian' },
  { isbn: '9780006480433', title: 'Catch-22',                     author: 'Joseph Heller',        genre: 'Satire' },
  { isbn: '9780140283297', title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', genre: 'Magical Realism' },
  { isbn: '9780553380163', title: "The Hitchhiker's Guide",       author: 'Douglas Adams',        genre: 'Science Fiction' },
  { isbn: '9780671027032', title: 'How to Win Friends',           author: 'Dale Carnegie',        genre: 'Self-Help' },
  { isbn: '9780743477123', title: 'Romeo and Juliet',             author: 'William Shakespeare',  genre: 'Classic' },
  { isbn: '9780062457714', title: 'A Brief History of Time',      author: 'Stephen Hawking',      genre: 'Non-Fiction' },
  { isbn: '9780385737951', title: 'The Fault in Our Stars',       author: 'John Green',           genre: 'Young Adult' },
  { isbn: '9780553588484', title: 'A Song of Ice and Fire',       author: 'George R.R. Martin',   genre: 'Fantasy' },
  { isbn: '9780062316110', title: 'The Power of Now',             author: 'Eckhart Tolle',        genre: 'Self-Help' },
  { isbn: '9780385333481', title: 'The Shining',                  author: 'Stephen King',         genre: 'Horror' },
  { isbn: '9780679601685', title: 'Anna Karenina',                author: 'Leo Tolstoy',          genre: 'Classic' },
];

// user_id 2..11 → ahmet..naz, each gets 3 books cycling
const conditions = ['Like New', 'Fine', 'Very Good', 'Good', 'Fair'];
const userBooks = [];
users.slice(1).forEach((u, ui) => {
  for (let b = 0; b < 3; b++) {
    const bookIdx = (ui * 3 + b) % books.length;
    userBooks.push({ username: u.username, isbn: books[bookIdx].isbn, condition: conditions[(ui + b) % conditions.length] });
  }
});

async function run() {
  // Tables
  await pool.query(`
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
  `);
  console.log('Tables ready.');

  // Users
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (username, password, email, phone, address)
       VALUES ($1, $2, $3, '', '')
       ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.email]
    );
  }
  console.log('Users seeded.');

  // Books
  for (const b of books) {
    await pool.query(
      `INSERT INTO books (isbn, title, author, genre)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (isbn) DO NOTHING`,
      [b.isbn, b.title, b.author, b.genre]
    );
  }
  console.log('Books seeded.');

  // users_books
  for (const ub of userBooks) {
    const res = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [ub.username]);
    if (res.rows.length > 0) {
      const userId = res.rows[0].user_id;
      await pool.query(
        `INSERT INTO users_books (user_id, bookisbn, condition)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [userId, ub.isbn, ub.condition]
      );
    }
  }
  console.log('User books seeded.');

  console.log('Done.');
  process.exit(0);
}

run().catch(err => { console.error(err.message); process.exit(1); });

