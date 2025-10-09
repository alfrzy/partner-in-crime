const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controller/notificationController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);

module.exports = router;