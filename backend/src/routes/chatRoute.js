const express = require('express');
const router = express.Router();
const { initiateChat, sendMessage, getMessages, getChatList } = require('../controller/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getChatList); // Daftar chat
router.post('/', verifyToken, initiateChat); // Memulai chat baru
router.get('/:roomId/messages', verifyToken, getMessages); // Riwayat pesan
router.post('/:roomId/messages', verifyToken, sendMessage); // Kirim pesan

module.exports = router;