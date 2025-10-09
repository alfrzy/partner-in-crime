// src/component/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import CreatePostModal from './PostModal';

function MainLayout() {
  const { isCreateModalOpen, openCreateModal, closeCreateModal } = useAuth();

  return (
    <div className="pb-20">
      {/* Outlet akan merender komponen halaman yang aktif (Beranda, Profil, dll) */}
      <Outlet /> 

      {/* Modal dan Navigasi sekarang tinggal di sini */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal} 
      />
      <BottomNav 
        onPlusClick={openCreateModal} 
      />
    </div>
  );
}

export default MainLayout;