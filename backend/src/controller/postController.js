// src/controllers/postController.js
const pool = require('../db');

// Fungsi untuk membuat postingan baru
exports.createPost = async (req, res) => {
  const { content, description } = req.body;
  const userId = req.user.id;
  // Ambil path file dari 'req.file' yang dibuat oleh multer. Bisa jadi null jika tidak ada file.
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Tambahkan 'image_url' ke dalam query INSERT
    const newPostQuery = await pool.query(
      "INSERT INTO posts (user_id, content, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, content, description, imageUrl]
    );
    const newPost = newPostQuery.rows[0];

    const io = req.app.get('socketio');
    
    // Ambil data lengkap postingan (termasuk image_url) untuk dikirim via socket
    const postForSocket = await pool.query(
        `SELECT 
           p.id, p.content, p.description, p.created_at, p.image_url,
           u.full_name, u.profile_picture 
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1`,
        [newPost.id]
      );

    io.emit('receive_post', postForSocket.rows[0]);

    res.status(201).json(postForSocket.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Fungsi untuk mendapatkan semua postingan
exports.getAllPosts = async (req, res) => {
  try {
    const allPosts = await pool.query(
      `SELECT 
        p.id, p.user_id, p.content, p.description, p.created_at, p.image_url,
        u.full_name, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC`
    );
    res.json(allPosts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.toggleLike = async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.postId, 10);
  const io = req.app.get('socketio');

  if (isNaN(postId)) {
    return res.status(400).send('Post ID tidak valid.');
  }

  try {
    const existingLike = await pool.query(
      "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    if (existingLike.rows.length > 0) {
      // JIKA SUDAH LIKE -> LAKUKAN UNLIKE
      await pool.query(
        "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );
    } else {
      // JIKA BELUM LIKE -> LAKUKAN LIKE
      await pool.query(
        "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
        [userId, postId]
      );

      // --- LOGIKA NOTIFIKASI DIMASUKKAN KEMBALI DI SINI ---
      const postAuthor = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
      if (postAuthor.rows.length > 0) {
        const recipientId = postAuthor.rows[0].user_id;

        // Jangan kirim notifikasi ke diri sendiri
        if (recipientId !== userId) {
          await pool.query(
            `INSERT INTO notifications (recipient_id, sender_id, type, post_id) VALUES ($1, $2, 'like', $3)`,
            [recipientId, userId, postId]
          );
          // Di sini Anda bisa menambahkan emit socket untuk notifikasi real-time nanti
        }
      }
      // --- AKHIR LOGIKA NOTIFIKASI ---
    }

    // Hitung ulang jumlah like setelah operasi
    const countResult = await pool.query("SELECT COUNT(*) FROM likes WHERE post_id = $1", [postId]);
    const likeCount = parseInt(countResult.rows[0].count, 10);
    
    io.emit('like_update', { postId, likeCount });

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// BARU: Fungsi untuk menambah komentar
exports.addComment = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { content } = req.body;
  const io = req.app.get('socketio');

  try {
    const newCommentQuery = await pool.query(
      "INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING id, content, created_at",
      [content, userId, postId]
    );

    // Ambil data lengkap komentar (dengan info user) untuk dikirim
    const completeComment = await pool.query(
        `SELECT c.id, c.content, c.created_at, c.post_id, u.full_name, u.profile_picture 
         FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
        [newCommentQuery.rows[0].id]
    );
    const newCommentData = completeComment.rows[0];

    const postAuthor = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
const recipientId = postAuthor.rows[0].user_id;

if (recipientId !== userId) {
    await pool.query(
        `INSERT INTO notifications (recipient_id, sender_id, type, post_id) VALUES ($1, $2, 'comment', $3)`,
        [recipientId, userId, postId]
    );
    // Kirim notifikasi real-time
}
    // Kirim siaran komentar baru
    io.emit('new_comment', newCommentData);

    res.status(201).json(newCommentData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// BARU: Fungsi untuk mendapatkan semua komentar di sebuah post
exports.getComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.full_name, u.profile_picture, c.user_id 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getLikedPostsByUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT post_id FROM likes WHERE user_id = $1",
      [userId]
    );
    // Ubah array of objects menjadi array of numbers (IDs)
    const likedPostIds = result.rows.map(row => row.post_id);
    res.json(likedPostIds);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getMyPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    // Query-nya mirip dengan getAllPosts, tapi dengan filter WHERE
    const myPosts = await pool.query(
      `SELECT 
         p.id, p.user_id, p.content, p.description, p.created_at, p.image_url,
         u.full_name, u.profile_picture,
         (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(myPosts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deletePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    // PENTING: Cek kepemilikan post sebelum menghapus
    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Postingan tidak ditemukan." });
    }
    
    if (post.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan pemilik postingan ini." });
    }

    // Jika user adalah pemilik, lanjutkan hapus
    await pool.query("DELETE FROM posts WHERE id = $1 AND user_id = $2", [postId, userId]);

    res.json({ message: "Postingan berhasil dihapus." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};