const pool = require('../db');

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await pool.query(
      `SELECT n.*, u.full_name AS sender_name, u.profile_picture AS sender_picture
       FROM notifications n
       JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json(notifications.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};