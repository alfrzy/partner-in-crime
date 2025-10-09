// src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // <-- Tambahkan multer

// Perbaiki path: 'controllers' (jamak), bukan 'controller'
const { 
  createPost, 
  getAllPosts,
  toggleLike,
  addComment,
  getComments,
  getLikedPostsByUser,
  getMyPosts,
  deletePost
} = require('../controller/postController');
const verifyToken = require('../middleware/authMiddleware');

// Konfigurasi Multer untuk menyimpan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Folder tempat menyimpan file
    },
    filename: function (req, file, cb) {
        // Membuat nama file unik untuk menghindari konflik
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/', getAllPosts);

router.post('/create', verifyToken, upload.single('postImage'), createPost);

router.post('/:postId/like', verifyToken, toggleLike);

router.post('/:postId/comments', verifyToken, addComment);

router.get('/:postId/comments', getComments);

router.get('/liked-by-user', verifyToken, getLikedPostsByUser);

router.post('/:postId/like', verifyToken, toggleLike);

router.get('/my-posts', verifyToken, getMyPosts);

router.delete('/:postId', verifyToken, deletePost);

module.exports = router;