// src/controllers/userController.js
const pool = require('../db');

exports.getUserProfileAndPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Ambil data profil pengguna
    const profileQuery = pool.query(
      `SELECT id, full_name, email, age, profile_picture, hobby 
       FROM users WHERE id = $1`,
      [userId]
    );

    // 2. Ambil semua postingan milik pengguna tersebut
    const postsQuery = pool.query(
      `SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Jalankan kedua query secara bersamaan
    const [profileResult, postsResult] = await Promise.all([profileQuery, postsQuery]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    // Gabungkan hasilnya
    const responseData = {
      profile: profileResult.rows[0],
      posts: postsResult.rows,
    };

    res.json(responseData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.searchUsers = async (req, res) => {
  // Ambil query pencarian dari URL, contoh: /api/users/search?name=budi
  const { name } = req.query;

  // Jika query kosong, kembalikan array kosong
  if (!name) {
    return res.json([]);
  }

  try {
    // Gunakan ILIKE untuk pencarian case-insensitive dan parsial
    // '%...%' berarti kita mencari nama yang mengandung query
    const searchResult = await pool.query(
      `SELECT id, full_name, profile_picture FROM users 
       WHERE full_name ILIKE $1 
       LIMIT 10`, // Batasi hasil agar tidak terlalu banyak
      [`%${name}%`]
    );
    res.json(searchResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};