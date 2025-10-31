import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import AdminDashboard from './AdminDashboard';

function App() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('app_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('app_currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('app_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('app_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_currentUser');
    }
  }, [currentUser]);

  const handleRegister = (newUser) => {
    if (users.find((user) => user.username === newUser.username)) {
      alert('Username sudah digunakan!');
      return false;
    }
    setUsers([...users, newUser]);
    return true;
  };

  const handleLogin = (loginData) => {
    const user = users.find(
      (u) => u.username === loginData.username && u.password === loginData.password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    } else {
      alert('Username atau password salah!');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreatePost = (postData) => {
    if (!currentUser) {
      alert('Anda harus login untuk membuat post!');
      return;
    }

    const newPost = {
      id: Date.now(),
      author: currentUser.username,
      text: postData.text,
      timestamp: new Date(),
    };

    setPosts([newPost, ...posts]);
    console.log('Database posts:', [newPost, ...posts]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              user={currentUser}
              onLogout={handleLogout}
              onCreatePost={handleCreatePost}
              posts={posts}
            />
          }
        />
        <Route
          path="/profile/:username"
          element={<ProfilePage allPosts={posts} allUsers={users} />}
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              currentUser={currentUser}
              allUsers={users}
              allPosts={posts}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
