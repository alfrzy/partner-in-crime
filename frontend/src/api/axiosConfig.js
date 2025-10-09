// src/api/axiosConfig.js
import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: 'http://192.168.231.28:3000/api' // URL dasar backend Anda
});

// Ini adalah "interceptor", sebuah fungsi yang berjalan SEBELUM setiap request dikirim
// Tujuannya adalah untuk menempelkan token JWT secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;