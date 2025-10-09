import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePostFeed } from '../hooks/usePostFeed';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axiosConfig';
import CommentModal from '../component/CommentModal';
import PostCardSkeleton from '../component/PostCardSkeleton';
import { FaHeart, FaComment, FaPaperPlane, FaTrash } from 'react-icons/fa';

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

function HomePage() {
  const { token, user, socket } = useAuth();
  const navigate = useNavigate();
  
  // State untuk data awal & UI spesifik halaman ini
  const [initialPosts, setInitialPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Gunakan custom hook untuk semua logika feed postingan
  const { posts, likedPosts, handleLike, handleDeletePost } = usePostFeed(initialPosts);

  // useEffect ini hanya untuk mengambil data awal
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    api.get('/posts')
      .then(res => setInitialPosts(res.data))
      .catch(err => console.error('Gagal mengambil data awal:', err))
      .finally(() => setIsLoading(false));
  }, [token, navigate]);

  // useEffect untuk logika search
  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearching(true);
      api.get(`/users/search?name=${debouncedSearchQuery}`)
        .then(res => setSearchResults(res.data))
        .catch(err => console.error(err))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);
  
  const handleInitiateChat = async (authorId) => {
    if (user?.id === authorId) {
        navigate('/profile');
        return;
    }
    try {
      const response = await api.post('/chats', { receiverId: authorId });
      navigate(`/chat/${response.data.roomId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Gagal memulai chat.";
      alert(errorMessage);
    }
  };

  const openCommentModal = (post) => setSelectedPostForComments(post);
  const closeCommentModal = () => setSelectedPostForComments(null);

  // Tampilan Loading Skeleton
  if (isLoading) {
    return (
        <main className="max-w-md mx-auto p-4">
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </main>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-10 p-4">
        <div className="max-w-md mx-auto">
          <a href='/'>
            <h1 className="text-xl font-bold text-blue-600 text-center mb-4">Partner in Crime</h1>
            </a>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari teman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg mt-1 max-h-60 overflow-y-auto z-20">
                    {isSearching && <p className="p-3 text-gray-500">Mencari...</p>}
                    {!isSearching && searchResults.length === 0 && debouncedSearchQuery && <p className="p-3 text-gray-500">Tidak ada hasil.</p>}
                    {searchResults.map(userResult => (
                      <Link 
                        to={`/user/${userResult.id}`} 
                        key={userResult.id} 
                        onClick={() => setSearchQuery('')}
                        className="flex items-center p-3 hover:bg-gray-100 border-b"
                      >
                        <img src={userResult.profile_picture ? `${BACKEND_URL}${userResult.profile_picture}` : `https://ui-avatars.com/api/?name=${userResult.full_name}`}
                             alt={userResult.full_name} className="w-8 h-8 rounded-full object-cover mr-3" />
                        <span>{userResult.full_name}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Link to={`/user/${post.user_id}`} className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0">
                      {post.profile_picture ? (
                        <img src={`${BACKEND_URL}${post.profile_picture}`} alt={post.full_name} className="w-full h-full rounded-full object-cover"/>
                      ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{post.full_name?.charAt(0).toUpperCase() || '?'}</div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 hover:underline">{post.full_name}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
                    </div>
                  </Link>
                  {user?.id === post.user_id && (
                    <button onClick={() => handleDeletePost(post.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
                      <FaTrash />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-gray-800 mb-2">{post.content}</p>
                  {post.description && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{post.description}</p>}
                  {post.image_url && <img src={`${BACKEND_URL}${post.image_url}`} alt="Post" className="mt-3 rounded-lg w-full h-auto object-cover"/>}
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-2 flex items-center gap-6">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-2">
                  <FaHeart className={`transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}/>
                  <span className="text-sm text-gray-600">{post.like_count}</span>
                </button>
                <button onClick={() => openCommentModal(post)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                  <FaComment />
                  <span className="text-sm text-gray-600">{post.comment_count}</span>
                </button>
                {user?.id !== post.user_id && (
                    <button onClick={() => handleInitiateChat(post.user_id)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                      <FaPaperPlane />
                      <span className="text-sm">Chat</span>
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <CommentModal isOpen={!!selectedPostForComments} post={selectedPostForComments} onClose={closeCommentModal} socket={socket} />
    </div>
  );
}

export default HomePage;