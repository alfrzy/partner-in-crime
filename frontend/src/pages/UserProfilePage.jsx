import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { usePostFeed } from '../hooks/usePostFeed';
import CommentModal from '../component/CommentModal';
import { FaArrowLeft, FaPaperPlane, FaHeart, FaComment } from 'react-icons/fa';

const BACKEND_URL = 'http://192.168.231.28:3000';

// Anda mungkin perlu fungsi formatTimeAgo di sini jika ingin menampilkannya di postingan
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

function UserProfilePage() {
  const { userId } = useParams();
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [initialPosts, setInitialPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { posts, likedPosts, handleLike } = usePostFeed(initialPosts);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data.profile);
        setInitialPosts(response.data.posts);
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);
  
  const handleInitiateChat = async (receiverId) => {
    if (user?.id === receiverId) {
        navigate('/profile');
        return;
    }
    try {
      const response = await api.post('/chats', { receiverId });
      navigate(`/chat/${response.data.roomId}`);
    } catch (error) {
      alert("Gagal memulai chat.");
      console.error(error);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Pengguna tidak ditemukan.</div>;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="bg-gray-100 min-h-screen pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto p-4 flex items-center">
            <Link to="/" className="p-2 mr-4"><FaArrowLeft /></Link>
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col items-center">
              <img src={profile.profile_picture ? `${BACKEND_URL}${profile.profile_picture}` : `https://ui-avatars.com/api/?name=${profile.full_name}`}
                   alt={profile.full_name} className="w-24 h-24 rounded-full object-cover shadow-md mb-4"/>
              
              {/* --- BAGIAN YANG DITAMBAHKAN KEMBALI --- */}
              <div className="text-left w-full mt-4 space-y-2">
                <p><strong>Umur:</strong> {profile.age || 'Tidak Diketahui'}</p>
                <p><strong>Hobi:</strong> {profile.hobby || 'Tidak Diketahui'}</p>
              </div>
              {/* --- AKHIR BAGIAN YANG DITAMBAHKAN --- */}

              {/* Tombol Chat */}
              <button onClick={() => handleInitiateChat(profile.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center mt-6">
                <FaPaperPlane className="mr-2"/> Chat dengan {profile.full_name.split(' ')[0]}
              </button>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Postingan dari {profile.full_name}</h2>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow">
                    <div className="p-4">
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
                        <p className="text-gray-800 mb-2">{post.content}</p>
                        {post.description && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{post.description}</p>}
                        {post.image_url && <img src={`${BACKEND_URL}${post.image_url}`} alt="Post" className="mt-3 rounded-lg w-full"/>}
                    </div>
                    <div className="border-t px-4 py-2 flex items-center gap-6">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-2">
                            <FaHeart className={`transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}/>
                            <span className="text-sm text-gray-600">{post.like_count}</span>
                        </button>
                        <button onClick={() => setSelectedPost(post)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                            <FaComment />
                            <span className="text-sm text-gray-600">{post.comment_count}</span>
                        </button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <CommentModal isOpen={!!selectedPost} post={selectedPost} onClose={() => setSelectedPost(null)} socket={socket}/>
    </motion.div>
  );
}

export default UserProfilePage;