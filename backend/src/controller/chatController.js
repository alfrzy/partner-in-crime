// src/controllers/chatController.js
const pool = require('../db');

exports.initiateChat = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;
  
  if (senderId === Number(receiverId)) {
      return res.status(400).json({ message: "Tidak bisa chat dengan diri sendiri."});
  }

  try {
    const existingRoom = await pool.query(
      `SELECT cp1.room_id FROM chat_participants cp1
       JOIN chat_participants cp2 ON cp1.room_id = cp2.room_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2`,
      [senderId, receiverId]
    );

    if (existingRoom.rows.length > 0) {
      return res.json({ roomId: existingRoom.rows[0].room_id });
    }

    const newRoom = await pool.query('INSERT INTO chat_rooms DEFAULT VALUES RETURNING id');
    const roomId = newRoom.rows[0].id;

    await pool.query('INSERT INTO chat_participants (user_id, room_id) VALUES ($1, $2), ($3, $2)', [senderId, roomId, receiverId]);
    
    res.status(201).json({ roomId });
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const { roomId } = req.params;
    const { content } = req.body;
    const io = req.app.get('socketio');

    try {
        const newMessage = await pool.query(
            `INSERT INTO messages (room_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
            [roomId, senderId, content]
        );
        
        const result = await pool.query(
            `SELECT m.*, u.full_name, u.profile_picture 
             FROM messages m JOIN users u ON m.sender_id = u.id 
             WHERE m.id = $1`, [newMessage.rows[0].id]
        );
        const messageData = result.rows[0];
        
        // Kirim pesan real-time ke semua orang di dalam room
        io.to(String(roomId)).emit('new_message', messageData);

        // --- Logika Notifikasi Chat Real-time ---
        console.log('Backend: Memulai logika notifikasi chat...');
        const participantResult = await pool.query(
            "SELECT user_id FROM chat_participants WHERE room_id = $1 AND user_id != $2",
            [roomId, senderId]
        );
        
        if (participantResult.rows.length > 0) {
            const recipientId = participantResult.rows[0].user_id;
            const recipientSocketId = io.onlineUsers[recipientId];
            console.log(`Backend: Penerima ID: ${recipientId}, Socket ID Penerima: ${recipientSocketId}`); // LOG 2
            
            const socketsInRoom = io.sockets.adapter.rooms.get(String(roomId)) || new Set();
            console.log('Backend: Sockets yang ada di room ini:', socketsInRoom); // LOG 3

            if (recipientSocketId && !socketsInRoom.has(recipientSocketId)) {
                console.log(`Backend: MENGIRIM event 'unread_chat_message' ke socket ${recipientSocketId}`); // LOG PENTING
                io.to(recipientSocketId).emit('unread_chat_message', {
                    fromRoomId: roomId,
                    senderName: messageData.full_name
                });
            }  else {
                console.log('Backend: TIDAK MENGIRIM notifikasi (penerima offline atau sudah di dalam room).'); // LOG PENTING
            }
        }
        // --- Akhir Logika Notifikasi ---

        res.status(201).json(messageData);
    } catch (err) { 
        console.error(err.message); 
        res.status(500).send('Server Error'); 
    }
};

exports.getMessages = async (req, res) => {
    const { roomId } = req.params;
    try {
        const messages = await pool.query(
            `SELECT m.*, u.full_name, u.profile_picture 
             FROM messages m JOIN users u ON m.sender_id = u.id
             WHERE m.room_id = $1 ORDER BY m.created_at ASC`,
            [roomId]
        );
        res.json(messages.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.getChatList = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT 
                cr.id AS room_id, 
                u.id AS user_id, 
                u.full_name, 
                u.profile_picture, 
                (SELECT content FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message,
                (SELECT created_at FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
            FROM chat_rooms cr
            JOIN chat_participants cp ON cr.id = cp.room_id
            JOIN users u ON u.id = cp.user_id
            WHERE cr.id IN (SELECT room_id FROM chat_participants WHERE user_id = $1)
            AND cp.user_id != $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};