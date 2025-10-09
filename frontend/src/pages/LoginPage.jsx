// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion'; // <-- Impor motion
import AppLogo from '../assets/logo.png'; // <-- Impor logo Anda

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token); // Simpan token ke context
      navigate('/'); // Arahkan ke beranda setelah login berhasil
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img src={AppLogo} alt="Partner in Crime Logo" className="w-24 h-24 mx-auto mb-4"/>
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang!</h1>
          <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
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
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Link ke Halaman Pendaftaran */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Belum punya akun?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
    </motion.div>
  );
}

export default LoginPage;