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
    // Cek apakah username atau email sudah ada
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, password_hash]
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
    // Cek user berdasarkan username
    // Kueri SELECT * akan mengambil semua kolom, termasuk 'is_admin'
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [
      username,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Username atau password salah!' });
    }

    const user = userResult.rows[0];

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password salah!' });
    }

    // Buat Token JWT Payload
    // Kita sertakan 'is_admin' di dalam token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '3h', // Token berlaku selama 3 jam
    });

    // Kirim token DAN data user (termasuk is_admin) ke frontend
    res.json({ token, user: payload });
  } catch (err)
 {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;