const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Cek apakah header 'Authorization' ada dan dimulai dengan 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Tambahkan data user (termasuk id, username, is_admin) ke object request
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token tidak valid.' });
  }
};

module.exports = auth;