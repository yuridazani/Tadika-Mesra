import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import AdminDashboard from './AdminDashboard';
import { jwtDecode } from 'jwt-decode'; // Impor jwt-decode

function App() {
  // State untuk menyimpan data user yang sedang login
  const [currentUser, setCurrentUser] = useState(null);

  // Cek token saat aplikasi pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('app_token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Cek apakah token sudah kedaluwarsa
        if (decodedUser.exp * 1000 < Date.now()) {
          handleLogout(); // Logout jika token expired
        } else {
          setCurrentUser(decodedUser); // Set user dari token
        }
      } catch (error) {
        console.error("Token tidak valid:", error);
        handleLogout(); // Logout jika token rusak/tidak valid
      }
    }
  }, []);

  // Fungsi ini dipanggil oleh LoginPage setelah login sukses
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    // Token sudah disimpan di localStorage oleh LoginPage
  };

  const handleLogout = () => {
    localStorage.removeItem('app_token');
    setCurrentUser(null);
  };

  // HAPUS: handleRegister (logika pindah ke RegisterPage)
  // HAPUS: handleCreatePost (logika pindah ke DashboardPage)
  // HAPUS: state users dan posts (data diambil oleh komponen masing-masing)
  // HAPUS: useEffect untuk menyimpan state ke localStorage

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Hapus prop onRegister */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              user={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProfilePage 
              currentUser={currentUser} // <-- TAMBAHKAN INI
              onUserUpdate={handleLogin} // <-- TAMBAHKAN INI (kita gunakan onLogin)
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
