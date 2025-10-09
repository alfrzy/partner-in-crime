// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Impor rute-rute Anda
const userRoutes = require('./src/routes/userRoute');
const authRoutes = require('./src/routes/authRoute');
const postRoutes = require('./src/routes/postRoute');
const profileRoutes = require('./src/routes/profileRoute');
const chatRoutes = require ('./src/routes/chatRoute');
const notificationRoutes = require ('./src/routes/notificationRoute');

const app = express();

// Konfigurasi CORS secara eksplisit untuk mengizinkan frontend Anda
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json()); // Middleware untuk membaca JSON body

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Buat 'onlineUsers' sebagai properti dari 'io' agar bisa diakses di controller
io.onlineUsers = {};

// Tempelkan 'io' ke object 'app' agar bisa diakses dari controller
app.set('socketio', io);

// Gunakan Rute API Anda
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); 
app.use('/api/profile', profileRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Sajikan file statis dari folder 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logika koneksi Socket.IO
io.on('connection', (socket) => {
  console.log('Pengguna terhubung:', socket.id);

  socket.on('user_online', (userId) => {
    io.onlineUsers[userId] = socket.id;
    console.log('User online:', io.onlineUsers);
  });

  socket.on('join_room', (roomId) => {
    socket.join(String(roomId)); // Pastikan roomId adalah string
    console.log(`User ${socket.id} bergabung di ruang ${roomId}`);
  });
  
  socket.on('leave_room', (roomId) => {
    socket.leave(String(roomId)); // Pastikan roomId adalah string
    console.log(`User ${socket.id} meninggalkan ruang ${roomId}`);
  });

  socket.on('disconnect', () => {
    // Hapus user dari daftar online saat disconnect
    for (const userId in io.onlineUsers) {
      if (io.onlineUsers[userId] === socket.id) {
        delete io.onlineUsers[userId];
        break;
      }
    }
    console.log('User terputus:', socket.id);
    console.log('User online saat ini:', io.onlineUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));