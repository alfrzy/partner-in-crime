import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const BACKEND_URL = 'http://192.168.231.28:3000';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Gagal mengambil notifikasi:", err));
  }, []);

  const getNotificationMessage = (notif) => {
    if (notif.type === 'like') {
        return <p><span className="font-semibold">{notif.sender_name}</span> menyukai postingan Anda.</p>
    }
    if (notif.type === 'comment') {
        return <p><span className="font-semibold">{notif.sender_name}</span> mengomentari postingan Anda.</p>
    }
    return '';
  }

  return (
    // PERBAIKAN: Hapus pb-20 karena padding diatur oleh MainLayout
    <div className="bg-gray-100 min-h-screen"> 
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-md mx-auto p-4 text-center"><h1 className="text-xl font-bold">Notifikasi</h1></div>
        </header>
        <main className="max-w-md mx-auto">
            <div>
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className={`flex items-center p-4 border-b ${!notif.is_read ? 'bg-blue-50' : 'bg-white'}`}>
                            <img src={notif.sender_picture ? `${BACKEND_URL}${notif.sender_picture}` : `https://ui-avatars.com/api/?name=${notif.sender_name}`}
                                alt={notif.sender_name} className="w-10 h-10 rounded-full object-cover mr-4" />
                            <div className="flex-1 text-sm">{getNotificationMessage(notif)}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 p-8">Tidak ada notifikasi baru.</p>
                )}
            </div>
        </main>
    </div>
  );
}
export default NotificationsPage;