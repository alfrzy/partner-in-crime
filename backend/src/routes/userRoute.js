// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfileAndPosts, searchUsers  } = require('../controller/userController');

// Rute untuk mendapatkan profil publik dan postingan pengguna berdasarkan ID
// GET /api/users/:userId
router.get('/search', searchUsers);
router.get('/:userId', getUserProfileAndPosts);


module.exports = router;