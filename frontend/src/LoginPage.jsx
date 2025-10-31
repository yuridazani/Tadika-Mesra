import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Impor axios
import { API_URL } from './apiConfig'; // Impor URL API

function LoginPage({ onLogin }) { // Ambil prop onLogin dari App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => { // Buat jadi async
    event.preventDefault();
    
    if (!username || !password) {
      alert('Username dan password harus diisi!');
      return;
    }
    
    try {
      // Panggil API untuk login
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      // Backend mengirim 'token' dan 'user'
      const { token, user } = response.data;
      
      // 1. Simpan token ke localStorage
      localStorage.setItem('app_token', token);
      
      // 2. Kirim data user (termasuk is_admin) ke App.jsx
      onLogin(user);

      // --- 👇 PERUBAHAN UTAMA ADA DI SINI 👇 ---
      // 3. Arahkan berdasarkan role user
      if (user.is_admin) {
        navigate('/admin'); // <-- KIRIM ADMIN KE SINI
      } else {
        navigate('/dashboard'); // <-- KIRIM USER BIASA KE SINI
      }
      // --- 👆 AKHIR DARI PERUBAHAN 👆 ---
      
    } catch (error) {
      console.error('Error login:', error);
      if (error.response && error.response.data) {
        alert(`Login Gagal: ${error.response.data.message}`);
      } else {
        alert('Login Gagal. Coba lagi nanti.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-lato bg-white-smoke">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">
            Welcome Back
          </h1>
          <p className="mt-2 text-walnut-brown">
            Sign in untuk melanjutkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-walnut-brown">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md border-beaver/50 focus:ring-chocolate-cosmos focus:border-chocolate-cosmos"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-walnut-brown">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md border-beaver/50 focus:ring-chocolate-cosmos focus:border-chocolate-cosmos"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 font-bold text-white transition-transform duration-300 transform bg-chocolate-cosmos rounded-full hover:scale-105"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-center text-walnut-brown">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold hover:underline text-chocolate-cosmos">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;