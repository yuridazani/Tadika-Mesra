import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './apiConfig';
import { Trash2, Edit, X, Save } from 'lucide-react';

function ProfilePage({ currentUser, onUserUpdate }) { 
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk mode editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '', password: '' });

  // Cek apakah user yang login adalah pemilik profil ini
  const isOwner = currentUser?.username === username;
  const token = localStorage.getItem('app_token');

  useEffect(() => {
    const fetchData = async () => {
      // ... (fungsi fetchData Anda dari langkah sebelumnya SAMA PERSIS)
      try {
        setLoading(true);
        setError(null);
        
        const userResponse = await axios.get(`${API_URL}/users/${username}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfileUser(userResponse.data); 
        // Set data untuk form edit
        setEditData({ 
          username: userResponse.data.username, 
          email: userResponse.data.email, 
          password: '' // Kosongkan password
        });

        const postsResponse = await axios.get(`${API_URL}/posts`);
        const allPosts = postsResponse.data;
        const foundPosts = allPosts.filter(post => post.author === username);
        setUserPosts(foundPosts);
        
      } catch (err) {
        console.error("Gagal mengambil data profile:", err);
        if (err.response && err.response.status === 404) {
            setError("User tidak ditemukan.");
        } else {
            setError("Gagal memuat data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, token]); // Tambahkan token sebagai dependensi

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  // --- FUNGSI BARU UNTUK HAPUS POST ---
  const handleDeletePost = async (postId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      try {
        await axios.delete(`${API_URL}/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Update state di frontend
        setUserPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Gagal menghapus post:', error);
        alert('Gagal menghapus post: ' + (error.response?.data?.message || 'Error tidak diketahui'));
      }
    }
  };

  // --- FUNGSI BARU UNTUK EDIT PROFIL ---
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Kirim data. Jika password kosong, jangan dimasukkan
    const dataToSubmit = {
      username: editData.username,
      email: editData.email,
    };
    if (editData.password) {
      dataToSubmit.password = editData.password;
    }

    try {
      const response = await axios.put(`${API_URL}/users/me`, dataToSubmit, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const { token: newToken, user: updatedUser } = response.data;

      // 1. Update token di localStorage
      localStorage.setItem('app_token', newToken);
      // 2. Update state di App.jsx
      onUserUpdate(updatedUser);
      // 3. Update state lokal di halaman ini
      setProfileUser(updatedUser);
      // 4. Keluar dari mode edit
      setIsEditing(false);

      // 5. Penting: Jika username berubah, navigasi ke URL baru
      if (username !== updatedUser.username) {
        navigate(`/profile/${updatedUser.username}`);
      }

    } catch (error) {
      console.error('Gagal update profil:', error);
      alert('Gagal update profil: ' + (error.response?.data?.message || 'Error tidak diketahui'));
    }
  };

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white-smoke">
        <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">Memuat Profil...</h1>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white-smoke">
        <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">User Not Found</h1>
        {/* Tampilkan pesan error yang lebih spesifik */}
        <p className="mt-2 text-walnut-brown">
          Profil untuk "{username}" tidak dapat ditemukan. {error}
        </p>
        <Link to="/dashboard" className="mt-6 font-semibold text-chocolate-cosmos hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-smoke font-lato">
      <header className="p-6 bg-white shadow-md">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="text-sm font-semibold text-chocolate-cosmos hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
          
          {/* --- TAMPILKAN FORM EDIT JIKA isEditing --- */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Password Baru (Kosongkan jika tidak ingin ganti)</label>
                <input
                  type="password"
                  name="password"
                  value={editData.password}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">
                  <Save size={18} /> Simpan
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 font-semibold bg-gray-200 rounded-md hover:bg-gray-300">
                  <X size={18} /> Batal
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* --- TAMPILKAN INFO PROFIL JIKA TIDAK MENGEDIT --- */}
              <div className="flex items-center justify-between mt-4">
                <h1 className="text-5xl font-bold font-playfair text-chocolate-cosmos">
                  {profileUser.username}
                </h1>
                {/* Tampilkan Tombol Edit HANYA jika Anda pemilik profil */}
                {isOwner && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 font-semibold transition-colors bg-white-smoke rounded-md text-walnut-brown hover:bg-beaver/30"
                  >
                    <Edit size={18} /> Edit Profil
                  </button>
                )}
              </div>
              <p className="text-lg text-walnut-brown">{profileUser.email}</p>
            </>
          )}
        </div>
      </header>
      
      <main className="max-w-4xl p-4 mx-auto md:p-8">
        <h2 className="text-2xl font-bold text-walnut-brown">
          Semua Postingan ({userPosts.length})
        </h2>
        <div className="mt-4 space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="relative p-5 bg-white shadow-lg rounded-xl">
                
                {/* --- TOMBOL HAPUS (HANYA UNTUK PEMILIK) --- */}
                {isOwner && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-3 right-3 p-1 text-walnut-brown/50 hover:text-red-600 hover:bg-red-100 rounded-full"
                    title="Hapus postingan"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="mb-3 text-sm text-walnut-brown/70">
                  Diposting pada {formatTimestamp(post.created_at)}
                </div>
                {post.text_content && (
                  <p className="text-lg text-black-custom">{post.text_content}</p>
                )}
                {post.image_url && (
                    <div className="mt-4">
                      <img
                        src={post.image_url}
                        alt="Lampiran post"
                        className="object-contain w-full h-auto bg-gray-100 rounded-lg max-h-96"
                      />
                    </div>
                )}
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-walnut-brown/80">
              {username} belum memiliki postingan.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;