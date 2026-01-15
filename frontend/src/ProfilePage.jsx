import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './apiConfig';
import { Trash2, Edit, X, Save, Key, Mail, User } from 'lucide-react'; // Tambah icon Key, Mail, User

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
  }, [username, token]); 

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      try {
        await axios.delete(`${API_URL}/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Gagal menghapus post:', error);
        alert('Gagal menghapus post: ' + (error.response?.data?.message || 'Error tidak diketahui'));
      }
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
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

      localStorage.setItem('app_token', newToken);
      onUserUpdate(updatedUser);
      setProfileUser(updatedUser);
      setIsEditing(false);

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
        <div className="w-16 h-16 mb-4 border-4 border-dashed rounded-full border-chocolate-cosmos animate-spin"></div>
        <h1 className="text-2xl font-bold font-playfair text-chocolate-cosmos">Memuat Profil...</h1>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white-smoke">
        <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">User Not Found</h1>
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
      {/* HEADER SECTION */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl p-6 mx-auto">
          <Link to="/dashboard" className="text-sm font-semibold transition-colors text-walnut-brown hover:text-chocolate-cosmos">
            &larr; Kembali ke Dashboard
          </Link>
          
          {/* --- TAMPILAN FORM EDIT (RE-DESIGNED) --- */}
          {isEditing ? (
            <div className="mt-6 animate-fade-in-down">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-playfair text-chocolate-cosmos">Edit Profil</h2>
                <button onClick={() => setIsEditing(false)} className="text-walnut-brown hover:text-red-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 border rounded-xl bg-white-smoke/50 border-beaver/20">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* Input Username */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-walnut-brown flex items-center gap-2">
                      <User size={14}/> Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-white border border-beaver/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate-cosmos/20 focus:border-chocolate-cosmos transition-all text-black-custom placeholder-walnut-brown/50"
                      placeholder="Username baru"
                    />
                  </div>

                  {/* Input Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-walnut-brown flex items-center gap-2">
                      <Mail size={14}/> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-white border border-beaver/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate-cosmos/20 focus:border-chocolate-cosmos transition-all text-black-custom placeholder-walnut-brown/50"
                      placeholder="Email baru"
                    />
                  </div>

                  {/* Input Password (Full Width) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-walnut-brown flex items-center gap-2">
                      <Key size={14}/> Password Baru <span className="text-[10px] font-normal normal-case text-walnut-brown/60">(Kosongkan jika tidak ingin mengganti)</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={editData.password}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-white border border-beaver/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chocolate-cosmos/20 focus:border-chocolate-cosmos transition-all text-black-custom placeholder-walnut-brown/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Buttons Action */}
                <div className="flex justify-end gap-3 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="px-6 py-2 font-bold text-walnut-brown transition-colors border border-walnut-brown/30 rounded-full hover:bg-walnut-brown/10 hover:text-chocolate-cosmos"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 px-6 py-2 font-bold text-white transition-transform transform bg-chocolate-cosmos rounded-full hover:scale-105 shadow-md"
                  >
                    <Save size={18} /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* --- TAMPILAN NORMAL (INFO PROFIL) --- */
            <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold font-playfair text-chocolate-cosmos">
                  {profileUser.username}
                </h1>
                <p className="mt-2 text-xl text-walnut-brown flex items-center gap-2">
                  <Mail size={18} className="text-beaver"/> {profileUser.email}
                </p>
                {profileUser.is_admin && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-white bg-beaver rounded-full">
                    ADMIN
                  </span>
                )}
              </div>

              {/* Tampilkan Tombol Edit HANYA jika Anda pemilik profil */}
              {isOwner && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 font-bold transition-all border-2 border-chocolate-cosmos text-chocolate-cosmos rounded-full hover:bg-chocolate-cosmos hover:text-white"
                >
                  <Edit size={20} /> Edit Profil
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* POST LIST */}
      <main className="max-w-4xl p-4 mx-auto md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-walnut-brown font-playfair">
            Postingan
          </h2>
          <span className="px-3 py-1 text-sm font-bold text-white bg-beaver rounded-full">
            {userPosts.length}
          </span>
        </div>

        <div className="space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="relative p-6 bg-white border border-transparent shadow-lg rounded-xl hover:border-beaver/20 transition-all">
                
                {/* --- TOMBOL HAPUS --- */}
                {isOwner && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-4 right-4 p-2 text-walnut-brown/40 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Hapus postingan"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar Mini (Inisial) */}
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-beaver shrink-0">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="block font-bold text-chocolate-cosmos leading-tight">{post.author}</span>
                    <span className="text-xs text-walnut-brown/70">
                      {formatTimestamp(post.created_at)}
                    </span>
                  </div>
                </div>

                {post.text_content && (
                  <p className="text-lg leading-relaxed text-black-custom whitespace-pre-wrap pl-1">{post.text_content}</p>
                )}
                
                {post.image_url && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-white-smoke">
                      <img
                        src={post.image_url}
                        alt="Lampiran post"
                        className="object-contain w-full h-auto max-h-[500px] bg-gray-50"
                      />
                    </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-2 border-dashed rounded-xl border-beaver/20">
              <p className="text-lg font-semibold text-walnut-brown">Belum ada postingan.</p>
              {isOwner && (
                <Link to="/dashboard" className="mt-2 text-chocolate-cosmos hover:underline">
                  Mulai membuat postingan baru &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;