import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !email || !password) {
      alert('Semua field harus diisi!');
      return;
    }

    const success = onRegister({ username, email, password });
    
    if (success) {
      alert(`Registrasi untuk user ${username} berhasil! Silakan login.`);
      navigate('/login'); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-lato bg-white-smoke">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">
            Create Account
          </h1>
          <p className="mt-2 text-walnut-brown">
            Mulai perjalananmu bersama kami.
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
            <label htmlFor="email" className="block text-sm font-semibold text-walnut-brown">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Register
          </button>
        </form>
        <p className="text-sm text-center text-walnut-brown">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold hover:underline text-chocolate-cosmos">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;