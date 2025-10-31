const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth'); // Middleware auth kita
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const router = express.Router();

// --- Konfigurasi Multer untuk Upload Gambar ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Simpan di folder 'public/uploads' yang kita buat
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: timestamp-namaasli.jpg
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });
// -------------------------------------------

// GET /api/users - (Untuk AdminDashboard)
router.get('/users', auth, async (req, res) => {
  // Pastikan hanya admin yang bisa melihat daftar user
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

// GET /api/users/:username - Mengambil data profil satu user
// Kita masih pakai 'auth' agar hanya user yang login yang bisa melihat profil
router.get('/users/:username', auth, async (req, res) => {
  const { username } = req.params;
  try {
    // Ambil hanya data yang aman (bukan password hash)
    const userResult = await db.query(
      'SELECT id, username, email FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    // Kirim data user yang ditemukan
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// GET /api/posts - (Untuk DashboardPage & AdminDashboard)
router.get('/posts', async (req, res) => {
  try {
    // Kita JOIN dengan tabel 'users' untuk mendapatkan nama 'author'
    const postsResult = await db.query(
      `SELECT 
         p.id, p.text_content, p.image_url, p.created_at, 
         u.username AS author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC` // Terbaru di atas
    );
    res.json(postsResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/posts - (Untuk DashboardPage)
// Dilindungi oleh 'auth' (harus login) dan 'upload.single' (menerima 1 gambar)
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { text_content } = req.body;
  const author_id = req.user.id; // Didapat dari token (via middleware auth)

  if (!text_content && !req.file) {
      return res.status(400).json({ message: 'Post tidak boleh kosong (teks atau gambar diperlukan).' });
  }
  
  // Tentukan URL gambar. Ganti port 4000 jika server Anda beda.
  const image_url = req.file
  ? `/uploads/${req.file.filename}` // <-- Hapus http://localhost:4000
  : null;

  try {
    // Masukkan post baru ke database
    const newPost = await db.query(
      'INSERT INTO posts (text_content, image_url, author_id) VALUES ($1, $2, $3) RETURNING id',
      [text_content, image_url, author_id]
    );

    // Ambil data post yang baru saja dibuat (lengkap dengan nama author)
     const postResult = await db.query(
      `SELECT 
         p.id, p.text_content, p.image_url, p.created_at, 
         u.username AS author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
       [newPost.rows[0].id]
    );

    const createdPost = postResult.rows[0];

    // --- INI PENAMBAHANNYA ---
    // Ambil 'io' dari request (yang kita suntikkan di server.js)
    // dan 'emit' (terompetkan) data post baru ke SEMUA KLIEN
    // dengan event bernama 'new_post'
    req.io.emit('new_post', createdPost);
    // -------------------------

    // Kirim post baru sebagai respons
    res.status(201).json(postResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/posts/:id - Menghapus postingan
// Dilindungi oleh middleware 'auth'
router.delete('/posts/:id', auth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id; // Didapat dari token

  try {
    // Kueri DELETE yang aman:
    // Hanya hapus jika ID post DAN author_id cocok
    const deleteResult = await db.query(
      'DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING *',
      [postId, userId]
    );

    // Cek apakah ada baris yang terhapus
    if (deleteResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Akses ditolak: Anda bukan pemilik postingan ini atau postingan tidak ditemukan.' 
      });
    }

    // --- TAMBAHKAN INI ---
    // "Terompetkan" ke semua klien bahwa post ini telah dihapus
    req.io.emit('post_deleted', { postId: postId });
    // ---------------------

    // Kirim status sukses (204 No Content)
    res.status(204).send(); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/users/me - Mengedit profil user yang sedang login
// Dilindungi oleh middleware 'auth'
router.put('/users/me', auth, async (req, res) => {
  const userId = req.user.id;
  const { username, email, password } = req.body;

  try {
    // 1. Cek apakah username/email baru sudah dipakai oleh user LAIN
    const conflictResult = await db.query(
      'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, userId]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan oleh user lain.' });
    }

    // 2. Buat kueri UPDATE
    let query;
    let queryParams;

    if (password) {
      // Jika user ingin mengganti password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING id, username, email, is_admin';
      queryParams = [username, email, password_hash, userId];
    } else {
      // Jika user TIDAK mengganti password
      query = 'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, is_admin';
      queryParams = [username, email, userId];
    }

    const updateResult = await db.query(query, queryParams);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const updatedUser = updateResult.rows[0];

    // 3. Buat dan kirim token BARU (karena info username mungkin berubah)
    const payload = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      is_admin: updatedUser.is_admin
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });

    // Kirim token baru DAN data user baru
    res.json({ token, user: payload });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/users/:id - (Admin mengedit user)
// Dilindungi oleh 'auth'
router.put('/admin/users/:id', auth, async (req, res) => {
  // 1. Verifikasi bahwa user yang mengakses adalah admin
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
  }

  const { id: userIdToEdit } = req.params;
  const { username, email, password, is_admin } = req.body;

  try {
    // 2. Cek konflik username/email (tidak termasuk user yang sedang diedit)
    const conflictResult = await db.query(
      'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, userIdToEdit]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan oleh user lain.' });
    }

    // 3. Bangun kueri update
    let query;
    let queryParams;

    if (password) {
      // Jika admin ingin me-reset password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = $1, email = $2, password_hash = $3, is_admin = $4 WHERE id = $5 RETURNING id, username, email, is_admin';
      queryParams = [username, email, password_hash, is_admin, userIdToEdit];
    } else {
      // Jika password tidak diubah
      query = 'UPDATE users SET username = $1, email = $2, is_admin = $3 WHERE id = $4 RETURNING id, username, email, is_admin';
      queryParams = [username, email, is_admin, userIdToEdit];
    }

    const updateResult = await db.query(query, queryParams);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // 4. Kirim kembali data user yang sudah diupdate
    res.json(updateResult.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// DELETE /api/admin/posts/:id - (Admin menghapus postingan)
// Dilindungi oleh 'auth'
router.delete('/admin/posts/:id', auth, async (req, res) => {
  // 1. Verifikasi bahwa user yang mengakses adalah admin
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
  }

  const postId = req.params.id;

  try {
    // 2. Admin bisa hapus post apa saja, tanpa cek author_id
    const deleteResult = await db.query(
      'DELETE FROM posts WHERE id = $1 RETURNING *',
      [postId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
    }

    // --- TAMBAHKAN INI ---
    // "Terompetkan" ke semua klien bahwa post ini telah dihapus
    req.io.emit('post_deleted', { postId: postId });
    // ---------------------

    res.status(204).send(); // Sukses (No Content)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/admin/users/:id - (Admin menghapus user)
// Dilindungi oleh 'auth'
router.delete('/admin/users/:id', auth, async (req, res) => {
  // 1. Verifikasi bahwa user yang mengakses adalah admin
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
  }

  const userIdToDelete = req.params.id;

  // 2. (SANGAT PENTING) Mencegah admin menghapus akunnya sendiri
  if (req.user.id == userIdToDelete) {
    return res.status(400).json({ message: 'Admin tidak bisa menghapus akunnya sendiri.' });
  }

  try {
    // 3. Hapus user dari database
    // Karena kita set ON DELETE CASCADE di database,
    // semua postingan user ini akan otomatis terhapus juga.
    const deleteResult = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [userIdToDelete]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.status(204).send(); // Sukses (No Content)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;