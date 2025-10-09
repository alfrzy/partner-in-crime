import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Impor Link
import api from '../api/axiosConfig';
import { FaPaperPlane } from 'react-icons/fa';

const BACKEND_URL = 'http://192.168.231.28:3000';

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 60;
    if (interval < 60) return Math.floor(interval) + " menit lalu";
    interval = seconds / 3600;
    if (interval < 24) return Math.floor(interval) + " jam lalu";
    interval = seconds / 86400;
    return Math.floor(interval) + " hari lalu";
}

function CommentModal({ post, isOpen, onClose, socket }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchComments = async () => {
        try {
          const response = await api.get(`/posts/${post.id}/comments`);
          setComments(response.data);
        } catch (error) {
          console.error("Gagal mengambil komentar:", error);
        }
      };
      fetchComments();
    }
  }, [isOpen, post]);

  useEffect(() => {
    if (!socket || !isOpen) return;
    
    const handleNewComment = (commentData) => {
      if (commentData.post_id === post?.id) {
        setComments(prev => [commentData, ...prev]);
      }
    };
    
    socket.on('new_comment', handleNewComment);
    return () => {
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, post, isOpen]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setNewComment('');
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      alert("Gagal mengirim komentar.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-30">
      <div className="bg-white rounded-t-2xl w-full max-w-md h-[80%] flex flex-col">
        <div className="p-4 border-b text-center relative">
          <h2 className="font-bold">Komentar</h2>
          <button onClick={onClose} className="absolute top-2 right-4 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3">
              {/* 2. Bungkus avatar dengan Link */}
              <Link to={`/user/${comment.user_id}`}>
                <img
                    src={comment.profile_picture ? `${BACKEND_URL}${comment.profile_picture}` : `https://ui-avatars.com/api/?name=${comment.full_name}`}
                    alt={comment.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="bg-gray-100 rounded-lg p-2 flex-1">
                {/* 3. Bungkus nama dengan Link */}
                <Link to={`/user/${comment.user_id}`}>
                  <p className="font-semibold text-sm hover:underline">{comment.full_name}</p>
                </Link>
                <p className="text-gray-800">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

       <form onSubmit={handleCommentSubmit} className="p-4 border-t flex items-center gap-2">
      <input type="text"value={newComment}onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tulis komentar..."
          className="w-full p-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"/>
        <button type="submit" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
        <FaPaperPlane />
        </button>

      </form>
      </div>
    </div>
  );
}
export default CommentModal;