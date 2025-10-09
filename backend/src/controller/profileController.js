// src/controllers/profileController.js
const pool = require('../db');

// Mengambil data profil pengguna yang sedang login
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari token JWT
    
    // Ambil data user, TAPI JANGAN PERNAH ambil password_hash
    const userProfile = await pool.query(
      "SELECT id, full_name, email, age, profile_picture, hobby, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userProfile.rows.length === 0) {
      return res.status(404).json({ message: "Profil tidak ditemukan." });
    }

    res.json(userProfile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Memperbarui data profil pengguna
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, age, hobby } = req.body;
    
    // Dapatkan path gambar baru jika ada yang di-upload
    const newProfilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profile_picture;

    const updatedUser = await pool.query(
      `UPDATE users 
       SET full_name = $1, age = $2, hobby = $3, profile_picture = $4
       WHERE id = $5
       RETURNING id, full_name, email, age, profile_picture, hobby`,
      [fullName, age, hobby, newProfilePicture, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};