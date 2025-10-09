import { NavLink } from 'react-router-dom';
import { FaHome, FaPlusSquare, FaUser, FaCommentDots, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function BottomNav({ onPlusClick }) {
  const { unreadChats } = useAuth(); 
  console.log('BottomNav dirender, jumlah chat belum dibaca:', unreadChats.size);
  const activeLink = 'text-blue-600';
  const inactiveLink = 'text-gray-500 hover:text-blue-600';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-20">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {/* Link ke Beranda */}
        <NavLink to="/" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
          <div className="flex flex-col items-center">
            <FaHome size={24} />
            <span className="text-xs mt-1">Beranda</span>
          </div>
        </NavLink>

         <NavLink to="/chats" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
          <div className="relative flex flex-col items-center">
            {/* Tampilkan badge jika unreadChats tidak kosong */}
            {unreadChats.size > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            )}
            <FaCommentDots size={24} />
            <span className="text-xs mt-1">Chat</span>
          </div>
        </NavLink>
        
        {/* Tombol untuk Membuka Modal Buat Ajakan */}
        <button onClick={onPlusClick} className={inactiveLink}>
          <div className="flex flex-col items-center">
            <FaPlusSquare size={24} />
            <span className="text-xs mt-1">Buat Ajakan</span>
          </div>
        </button>

        <NavLink to="/notifications" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
          <div className="flex flex-col items-center">
          <FaBell size={24} /><span className="text-xs mt-1">Notifikasi</span>
          </div>
        </NavLink>

        {/* Link ke Profil */}
        <NavLink to="/profile" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
          <div className="flex flex-col items-center">
            <FaUser size={24} />
            <span className="text-xs mt-1">Profil</span>
          </div>
        </NavLink>
      </div>
    </nav>
  );
}

export default BottomNav;