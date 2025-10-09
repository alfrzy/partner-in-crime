import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const BACKEND_URL = 'http://192.168.231.28:3000'; 

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

function ProfilePage() {
  const { token, logout } = useAuth(); // <-- PERBAIKAN: Tambahkan 'logout' di sini
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', age: '', hobby: '' });
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const { showModal, hideModal } = useModal(); 

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const profilePromise = api.get('/profile');
        const postsPromise = api.get('/posts/my-posts');
        const [profileResponse, postsResponse] = await Promise.all([profilePromise, postsPromise]);
        
        setProfile(profileResponse.data);
        setFormData({
          fullName: profileResponse.data.full_name || '',
          age: profileResponse.data.age || '',
          hobby: profileResponse.data.hobby || '',
        });
        setMyPosts(postsResponse.data);
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    showModal({
      iconType: 'logout',
      title: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      actions: [
        { label: 'Batal', onClick: hideModal },
        { 
          label: 'Ya, Logout',
          onClick: () => {
            hideModal();
            logout();
            navigate('/login');
          },
          className: 'bg-red-600 hover:bg-red-700 text-white'
        }
      ]
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('age', formData.age);
    data.append('hobby', formData.hobby);
    if (newProfilePic) {
      data.append('profilePicture', newProfilePic);
    } else if (profile.profile_picture) {
      data.append('profile_picture', profile.profile_picture);
    }
    
    try {
      const response = await api.put('/profile', data);
      setProfile(response.data);
      setIsEditing(false);
      setNewProfilePic(null);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert("Gagal memperbarui profil.");
    }
  };

  const handleDeletePost = async (postId) => {
    showModal({
      iconType: 'warning',
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus postingan ini secara permanen?',
      actions: [
        { label: 'Batal', onClick: hideModal, className: 'bg-gray-200 hover:bg-gray-300' },
        { 
          label: 'Ya, Hapus',
          onClick: async () => {
            try {
              await api.delete(`/posts/${postId}`);
              setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } catch (error) {
              console.error("Gagal menghapus:", error);
            }
            hideModal();
          },
          className: 'bg-red-600 hover:bg-red-700 text-white'
        }
      ]
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Gagal memuat profil.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* PERBAIKAN: Hapus <BottomNav /> dari sini */}
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-md mx-auto p-4 text-center relative">
            <h1 className="text-xl font-bold">Profil Saya</h1>
            {/* Tombol Logout dipindah ke header agar lebih rapi */}
            <button onClick={handleLogout} className="absolute top-1/2 right-4 -translate-y-1/2 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                <FaSignOutAlt size={20}/>
            </button>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <img
                  src={profile.profile_picture ? `${BACKEND_URL}${profile.profile_picture}` : `https://ui-avatars.com/api/?name=${profile.full_name}&background=0D8ABC&color=fff&size=128`}
                  alt="Foto Profil"
                  className="rounded-full w-full h-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {!isEditing ? (
                // MODE LIHAT PROFIL
                <div className="text-center w-full">
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="text-left mt-6 w-full space-y-2">
                    <p><strong>Umur:</strong> {profile.age || 'Belum diisi'}</p>
                    <p><strong>Hobi:</strong> {profile.hobby || 'Belum diisi'}</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <FaEdit className="mr-2" /> Edit Profil
                  </button>
                </div>
              ) : (
                // MODE EDIT PROFIL
                <form onSubmit={handleUpdateProfile} className="w-full mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Nama Lengkap</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Umur</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Hobi</label>
                    <input type="text" name="hobby" value={formData.hobby} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium">Ganti Foto Profil</label>
                    <input type="file" onChange={(e) => setNewProfilePic(e.target.files[0])} className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"/>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                     <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 flex items-center">
                       <FaTimes className="mr-2"/> Batal
                     </button>
                     <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center">
                       <FaSave className="mr-2"/> Simpan
                     </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Postingan Saya</h2>
            <div className="space-y-4">
               {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow p-4 relative">
                    <div className="absolute top-2 right-2">
                       <button onClick={() => handleDeletePost(post.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                          <FaTrash />
                       </button>
                    </div>
                    <div>
                      <p className="text-gray-800 mb-2 pr-8">{post.content}</p>
                      {post.description && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{post.description}</p>}
                      {post.image_url && <img src={`${BACKEND_URL}${post.image_url}`} alt="Post" className="mt-3 rounded-lg w-full"/>}
                      <p className="text-xs text-gray-400 mt-3">{formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Anda belum membuat postingan apa pun.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}

export default ProfilePage;