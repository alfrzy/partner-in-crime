// src/pages/ChatRoomPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
// HAPUS: Impor 'io' dari 'socket.io-client' tidak dibutuhkan lagi
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

// HAPUS: Jangan buat koneksi socket baru di sini

function ChatRoomPage() {
  const { roomId } = useParams();
  // PERBAIKAN: Ambil 'socket' dan semua yang dibutuhkan dari context dalam satu panggilan
  const { token, clearUnreadChat, socket } = useAuth(); 
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Pastikan socket sudah siap sebelum digunakan
    if (!socket) return;

    clearUnreadChat(roomId);
    
    socket.emit('join_room', roomId);
    api.get(`/chats/${roomId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    const handleNewMessage = (message) => {
      if (Number(message.room_id) === Number(roomId)) {
        setMessages(prev => [...prev, message]);
      }
    };
    socket.on('new_message', handleNewMessage);
    
    return () => {
      socket.emit('leave_room', roomId);
      socket.off('new_message', handleNewMessage);
    };
  }, [roomId, clearUnreadChat, socket]); // <-- PERBAIKAN: Tambahkan 'socket' sebagai dependency

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    api.post(`/chats/${roomId}/messages`, { content: newMessage });
    setNewMessage('');
  };
  
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

  return (
    <div className="h-screen bg-gray-100 flex flex-col max-w-md mx-auto">
      <header className="bg-white shadow-md sticky top-0 z-10 flex items-center p-3">
          <Link to="/chats" className="p-2"><FaArrowLeft /></Link>
          <h1 className="text-lg font-bold mx-auto">Chat Room</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender_id === currentUserId ? 'bg-blue-600 text-white' : 'bg-white'}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex items-center gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan..." className="w-full p-2 border border-gray-300 rounded-full"/>
        <button type="submit" className="bg-blue-600 text-white p-3 rounded-full"><FaPaperPlane /></button>
      </form>
    </div>
  );
}

export default ChatRoomPage;