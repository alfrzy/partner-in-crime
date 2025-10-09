// src/pages/SignupPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../api/axiosConfig';

function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showModal, hideModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Kirim data ke server TERLEBIH DAHULU
      await api.post('/auth/signup', { fullName, email, password });

      // 2. JIKA berhasil, BARU tampilkan modal sukses
      showModal({
        iconType: 'success',
        title: 'Pendaftaran Berhasil!',
        message: 'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
        actions: [{ 
          label: 'OK', 
          onClick: () => {
            hideModal();
            navigate('/login');
          },
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        }]
      });

    } catch (error) {
      // 3. JIKA gagal, tangkap errornya dan tampilkan modal error
      const errorMessage = error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
      showModal({
        iconType: 'warning',
        title: 'Pendaftaran Gagal',
        message: errorMessage,
        actions: [{ label: 'Tutup', onClick: hideModal, className: 'bg-gray-200 hover:bg-gray-300' }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Buat Akun Baru</h1>
          <p className="text-gray-500 mt-2">Bergabung dengan Partner in Crime</p>
        </div>

        {/* Form Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input Nama Lengkap */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="kamu@contoh.com"
            />
          </div>

          {/* Input Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Tombol Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-300 ${
                isLoading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
        </form>

        {/* Link ke Halaman Login */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;