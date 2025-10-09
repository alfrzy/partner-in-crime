// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect, useCallback, onConnect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://192.168.231.28:3000';
const socket = io(BACKEND_URL, { autoConnect: false });

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [unreadChats, setUnreadChats] = useState(new Set());
  const [user, setUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  useEffect(() => {
    if (token) {
      socket.connect();
      localStorage.setItem('token', token);

      const userId = JSON.parse(atob(token.split('.')[1])).user.id;

      const onConnect = () => {
        console.log(`Socket terhubung dengan ID: ${socket.id}, mengirimkan info user ID: ${userId}`);
        socket.emit('user_online', userId);
      }
        socket.on('connect', onConnect);

        socket.emit('user_online', userId);

       socket.on('unread_chat_message', ({ fromRoomId }) => {
      // Selalu simpan sebagai string untuk konsistensi
      setUnreadChats(prev => new Set(prev).add(String(fromRoomId))); 
    });

    const userData = JSON.parse(atob(token.split('.')[1])).user;
      setUser(userData);

    } else {
      localStorage.removeItem('token');
      socket.disconnect();
      setUser(null);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('unread_chat_message');
    };
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);
  
   const clearUnreadChat = useCallback((roomId) => {
  setUnreadChats(prev => {
    const newUnread = new Set(prev);
    newUnread.delete(roomId); // <-- Langsung hapus sebagai String
    return newUnread;
  });
}, []);

  return (
    // PERBAIKAN: Tambahkan 'socket' ke dalam value
    <AuthContext.Provider value={{ 
      token,
      login, 
      user, 
      logout, 
      unreadChats, 
      clearUnreadChat, 
      socket,
      isCreateModalOpen, // <-- Bagikan state
      openCreateModal,   // <-- Bagikan fungsi
      closeCreateModal  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};