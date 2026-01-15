const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GET /api/users - Admin
router.get('/users', auth, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
  }
  try {
    const usersResult = await db.query('SELECT id, username, email FROM users');
    res.json(usersResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/users/:username
router.get('/users/:username', auth, async (req, res) => {
  const { username } = req.params;
  try {
    // Ganti $1 dengan ?
    const userResult = await db.query(
      'SELECT id, username, email FROM users WHERE username = ?',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/posts
router.get('/posts', async (req, res) => {
  try {
    // Query tetap sama (standard SQL)
    const postsResult = await db.query(
      `SELECT 
         p.id, p.text_content, p.image_url, p.created_at, 
         u.username AS author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(postsResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/posts
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { text_content } = req.body;
  const author_id = req.user.id;

  if (!text_content && !req.file) {
      return res.status(400).json({ message: 'Post tidak boleh kosong.' });
  }
  
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Insert tanpa RETURNING
    const insertResult = await db.query(
      'INSERT INTO posts (text_content, image_url, author_id) VALUES (?, ?, ?)',
      [text_content, image_url, author_id]
    );

    // Ambil ID dari insertResult.lastID
    const newPostId = insertResult.lastID;

    // Ambil data lengkap post
     const postResult = await db.query(
      `SELECT 
         p.id, p.text_content, p.image_url, p.created_at, 
         u.username AS author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
       [newPostId]
    );

    const createdPost = postResult.rows[0];
    req.io.emit('new_post', createdPost);
    res.status(201).json(createdPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/posts/:id
router.delete('/posts/:id', auth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Cek dulu apakah post ada dan milik user
    const checkPost = await db.query(
        'SELECT * FROM posts WHERE id = ? AND author_id = ?', 
        [postId, userId]
    );

    if (checkPost.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Akses ditolak atau post tidak ditemukan.' 
      });
    }

    // 2. Hapus
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    req.io.emit('post_deleted', { postId: postId });
    res.status(204).send(); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/users/me
router.put('/users/me', auth, async (req, res) => {
  const userId = req.user.id;
  const { username, email, password } = req.body;

  try {
    // Cek duplikasi
    const conflictResult = await db.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
    }

    let query;
    let queryParams;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?';
      queryParams = [username, email, password_hash, userId];
    } else {
      query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
      queryParams = [username, email, userId];
    }

    await db.query(query, queryParams);

    // Ambil data terbaru untuk token
    const userResult = await db.query('SELECT id, username, email, is_admin FROM users WHERE id = ?', [userId]);
    
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User error.' });
    }
    const updatedUser = userResult.rows[0];
    const isAdmin = updatedUser.is_admin === 1;

    const payload = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      is_admin: isAdmin
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
    res.json({ token, user: payload });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/users/:id
router.put('/admin/users/:id', auth, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  const { id: userIdToEdit } = req.params;
  const { username, email, password, is_admin } = req.body;
  // Convert boolean is_admin ke integer 0/1 untuk SQLite
  const isAdminInt = is_admin ? 1 : 0;

  try {
    const conflictResult = await db.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userIdToEdit]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username/email konflik.' });
    }

    let query;
    let queryParams;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = ?, email = ?, password_hash = ?, is_admin = ? WHERE id = ?';
      queryParams = [username, email, password_hash, isAdminInt, userIdToEdit];
    } else {
      query = 'UPDATE users SET username = ?, email = ?, is_admin = ? WHERE id = ?';
      queryParams = [username, email, isAdminInt, userIdToEdit];
    }

    await db.query(query, queryParams);

    // Ambil hasil update
    const updated = await db.query('SELECT id, username, email, is_admin FROM users WHERE id = ?', [userIdToEdit]);
    res.json(updated.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/admin/posts/:id
router.delete('/admin/posts/:id', auth, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }
  const postId = req.params.id;

  try {
    // Cek eksistensi
    const check = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (check.rows.length === 0) return res.status(404).json({message: 'Not found'});

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    req.io.emit('post_deleted', { postId: postId });
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/admin/users/:id
router.delete('/admin/users/:id', auth, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }
  const userIdToDelete = req.params.id;

  if (req.user.id == userIdToDelete) {
    return res.status(400).json({ message: 'Admin tidak bisa hapus diri sendiri.' });
  }

  try {
    const check = await db.query('SELECT * FROM users WHERE id = ?', [userIdToDelete]);
    if (check.rows.length === 0) return res.status(404).json({message: 'Not found'});

    // Karena ON DELETE CASCADE aktif di tabel SQLite (foreign key), posts user ini otomatis hilang
    // Tapi SQLite perlu di-enable foreign key supportnya. 
    // Defaultnya SQLite FK disabled.
    // Di db.js tambahkan: db.get("PRAGMA foreign_keys = ON");
    // Atau kita hapus manual post-nya dulu:
    await db.query('DELETE FROM posts WHERE author_id = ?', [userIdToDelete]);
    await db.query('DELETE FROM users WHERE id = ?', [userIdToDelete]);

    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;