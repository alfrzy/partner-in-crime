import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export function usePostFeed(initialPosts = []) {
  const { socket } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const { showModal, hideModal } = useModal(); 

  // Set postingan awal saat data dari page berhasil di-fetch
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Ambil data postingan yang sudah di-like oleh user
  useEffect(() => {
    api.get('/posts/liked-by-user')
      .then(res => setLikedPosts(new Set(res.data)))
      .catch(err => console.error("Gagal mengambil data liked posts:", err));
  }, []);

  // Setup semua listener real-time dari socket
  useEffect(() => {
    if (!socket) return;

    const handleReceivePost = (newPost) => setPosts(prev => [newPost, ...prev]);
    const handleLikeUpdate = ({ postId, likeCount }) => {
      setPosts(prev => prev.map(p => p.id === Number(postId) ? { ...p, like_count: likeCount } : p));
    };
    const handleNewComment = ({ post_id }) => {
      setPosts(prev => prev.map(p => p.id === Number(post_id) ? { ...p, comment_count: parseInt(p.comment_count) + 1 } : p));
    };

    socket.on('receive_post', handleReceivePost);
    socket.on('like_update', handleLikeUpdate);
    socket.on('new_comment', handleNewComment);

    return () => {
      socket.off('receive_post', handleReceivePost);
      socket.off('like_update', handleLikeUpdate);
      socket.off('new_comment', handleNewComment);
    };
  }, [socket]);

  // Fungsi untuk handle like/unlike
  const handleLike = async (postId) => {
    setLikedPosts(prevLikedPosts => {
      const newLikedPosts = new Set(prevLikedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      return newLikedPosts;
    });
    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      console.error("Gagal melakukan like:", error);
    }
  };
  
  // Fungsi untuk handle hapus post (kita pindah ke sini juga)
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

  // Kembalikan semua state dan fungsi yang dibutuhkan oleh komponen
  return { posts, likedPosts, handleLike, handleDeletePost };
}