// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controller/authController');

// Rute untuk pendaftaran
// POST /api/auth/signup
router.post('/signup', signup);

// Rute untuk login
// POST /api/auth/login
router.post('/login', login);

module.exports = router;