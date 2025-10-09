import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
const BACKEND_URL = 'http://192.168.231.28:3000';

function ChatListPage() {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    api.get('/chats')
      .then(res => setChats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-md mx-auto p-4 text-center">
                <h1 className="text-xl font-bold">Daftar Chat</h1>
            </div>
        </header>
        <main className="max-w-md mx-auto">
            <div>
                {chats.map(chat => (
                    <Link to={`/chat/${chat.room_id}`} key={chat.room_id} className="flex items-center p-4 border-b bg-white hover:bg-gray-50">
                        <img src={chat.profile_picture ? `${BACKEND_URL}${chat.profile_picture}` : `https://ui-avatars.com/api/?name=${chat.full_name}`}
                             alt={chat.full_name} className="w-12 h-12 rounded-full object-cover mr-4" />
                        <div className="flex-1">
                            <p className="font-semibold">{chat.full_name}</p>
                            <p className="text-sm text-gray-600 truncate">{chat.last_message || 'Belum ada pesan'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    </div>
  );
}

export default ChatListPage;