// src/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getProfile, updateProfile } = require('../controller/profileController');
const verifyToken = require('../middleware/authMiddleware');

// Gunakan konfigurasi multer yang sama seperti untuk post
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Rute untuk mendapatkan profil (terlindungi)
// GET /api/profile
router.get('/', verifyToken, getProfile);

// Rute untuk memperbarui profil (terlindungi + upload gambar)
// PUT /api/profile
router.put('/', verifyToken, upload.single('profilePicture'), updateProfile);

module.exports = router;