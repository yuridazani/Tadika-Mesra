const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Lokasi file database
const dbPath = path.resolve(__dirname, process.env.DB_DATABASE || 'tadika_mesra.db');

// Buat koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal membuka database SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite.');
    initTables(); // Buat tabel jika belum ada
  }
});

// Fungsi untuk inisialisasi tabel (Schema Migration)
function initTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0, -- 0 = false, 1 = true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_content TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      author_id INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `;

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createPostsTable);
    console.log('📦 Tabel users dan posts siap.');
  });
}

module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      const method = text.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';
      
      db[method](text, params, function (err, rows) {
        if (err) {
          console.error('SQL Error:', err.message, 'Query:', text);
          return reject(err);
        }
        
        // Format return disamakan dengan gaya 'pg' (res.rows)
        // 'this' context pada callback 'run' berisi lastID dan changes
        if (method === 'run') {
          resolve({ 
            rows: [], 
            rowCount: this.changes, 
            lastID: this.lastID // Penting untuk INSERT
          });
        } else {
          resolve({ rows: rows, rowCount: rows.length });
        }
      });
    });
  },
  dbInstance: db 
};