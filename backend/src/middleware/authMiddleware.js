// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari header 'Authorization'
  const authHeader = req.header('Authorization');

  // Jika tidak ada header, kirim error
  if (!authHeader) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    // Token dikirim dengan format "Bearer <token>"
    // Kita ambil bagian tokennya saja
    const token = authHeader.split(' ')[1];
    
    // Jika tidak ada token setelah kata 'Bearer'
    if (!token) {
        return res.status(401).json({ message: 'Format token salah.' });
    }

    // 2. Verifikasi token menggunakan secret key Anda
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Jika berhasil, simpan payload token ke 'req.user'
    // agar bisa diakses oleh rute selanjutnya
    req.user = decoded.user;
    
    // 4. Lanjutkan ke fungsi controller
    next();
  } catch (err) {
    // Jika token tidak valid (misalnya kedaluwarsa), kirim error
    res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
  }
};

module.exports = verifyToken;