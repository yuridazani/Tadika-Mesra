const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Cek username/email (Gunakan ?)
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Simpan user (SQLite tidak support RETURNING, jadi kita insert dulu)
    const insertResult = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    // 4. Ambil data user yang baru dibuat menggunakan lastID
    const newUserId = insertResult.lastID;
    const newUser = await db.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [newUserId]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Gunakan ?
    const userResult = await db.query('SELECT * FROM users WHERE username = ?', [
      username,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Username atau password salah!' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password salah!' });
    }

    // SQLite menyimpan boolean sebagai 0/1, jadi kita konversi ke boolean JS biar aman
    const isAdmin = user.is_admin === 1;

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: isAdmin 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;