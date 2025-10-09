/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // 1. Buat tabel users dengan kolom tambahan
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      age INTEGER,                        
      profile_picture TEXT,               
      hobby TEXT,                         
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Buat tabel posts dengan kolom description
  pgm.sql(`
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      description TEXT,                   -- KOLOM CATEGORY DIGANTI INI
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = pgm => {
  // Untuk membatalkan, kita hapus tabel dalam urutan terbalik
  // Hapus posts dulu karena punya foreign key ke users
  pgm.sql(`DROP TABLE posts;`);
  pgm.sql(`DROP TABLE users;`);
};