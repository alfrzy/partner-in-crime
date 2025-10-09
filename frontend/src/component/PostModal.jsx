// src/components/CreatePostModal.jsx
import { useState } from 'react';
import api from '../api/axiosConfig';

function CreatePostModal({ isOpen, onClose }) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    formData.append('description', description);
    if (imageFile) {
      formData.append('postImage', imageFile);
    }

    try {
      await api.post('/posts/create', formData);
      // Reset form dan tutup modal setelah berhasil
      setContent('');
      setDescription('');
      setImageFile(null);
      onClose(); // Panggil fungsi onClose dari props
    } catch (error) {
      alert('Gagal membuat postingan. Silakan coba lagi.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Jangan render apa pun jika modal tidak terbuka
  if (!isOpen) return null;

  return (
    // Backdrop (latar belakang gelap)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      {/* Konten Modal */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Buat Ajakan Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <form onSubmit={handleCreatePost}>
          {/* Formnya sama seperti yang ada di HomePage sebelumnya */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border-gray-300 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Ada ajakan apa hari ini?"
          ></textarea>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mt-2 border-gray-300 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="1"
            placeholder="Tambah deskripsi singkat... (opsional)"
          ></textarea>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-2"
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${
                isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Mengirim...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;