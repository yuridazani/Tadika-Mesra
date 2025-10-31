import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from './UserLayout';
import axios from 'axios';
import { API_URL } from './apiConfig'; 
import { io } from "socket.io-client"; 

const Avatar = ({ username }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return (
    <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-beaver">
      {initial}
    </div>
  );
};

function DashboardPage({ user, onLogout }) { 
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('app_token');

  // Efek 1: Ambil data awal
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } 
    // --- 👇 TAMBAHAN KODE DI SINI 👇 ---
    else if (user.is_admin) {
      // Jika user adalah admin, "usir" mereka ke panel admin.
      // Dashboard ini hanya untuk user biasa.
      navigate('/admin');
    } 
    // --- 👆 AKHIR TAMBAHAN 👆 ---
    else {
      setLoading(true); 
      fetchPosts();
    }
  }, [user, navigate]); // user dan navigate sudah ada di dependencies

  // Efek 2: Koneksi Socket.io
  useEffect(() => {
    if (!user) return; 

    const socket = io();

    socket.on('new_post', (newPost) => {
      setPosts((currentPosts) => [newPost, ...currentPosts]);
    });

    socket.on('post_deleted', (data) => {
      setPosts((currentPosts) => 
        currentPosts.filter(post => post.id != data.postId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]); 

  // Fungsi ambil data awal
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Gagal mengambil posts:', error);
    } finally {
      setLoading(false); 
    }
  };

  // Fungsi kirim post (tidak ada perubahan)
  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (!postText.trim() && !postImage) {
      alert('Post tidak boleh kosong (teks atau gambar)!');
      return;
    }
    const formData = new FormData();
    formData.append('text_content', postText);
    if (postImage) {
      formData.append('image', postImage);
    }
    try {
      await axios.post(`${API_URL}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPostText('');
      setPostImage(null);
      event.target.reset(); 
    } catch (error) {
      console.error('Gagal membuat post:', error);
      alert('Gagal membuat post.');
    }
  };

  // --- 👇 TAMBAHAN KODE DI SINI 👇 ---
  // Jika user adalah admin, component akan redirect, 
  // jadi kita return null lebih awal agar tidak render sisanya.
  if (!user || user.is_admin) return null; 
  // --- 👆 AKHIR TAMBAHAN 👆 ---

  const formatTimestamp = (date) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <UserLayout user={user} onLogout={onLogout}>
      <div className="max-w-3xl p-4 mx-auto md:p-8">
        <h1 className="mb-6 text-4xl font-bold font-playfair text-chocolate-cosmos">
          Selamat Datang, {user.username}!
        </h1>

        {/* Form Pembuat Postingan */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <div className="flex items-start gap-4">
            <Avatar username={user.username} />
            <form onSubmit={handlePostSubmit} className="flex-1">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`Apa yang kamu pikirkan, ${user.username}?`}
                className="w-full p-3 border rounded-md resize-none border-beaver/50 focus:ring-chocolate-cosmos focus:border-chocolate-cosmos"
                rows="3"
              ></textarea>
              
              <div className="mt-2">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setPostImage(e.target.files[0])}
                  className="w-full text-sm rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-chocolate-cosmos/10 file:text-chocolate-cosmos hover:file:bg-chocolate-cosmos/20"
                />
              </div>

              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white transition-transform duration-300 transform bg-chocolate-cosmos rounded-full hover:scale-105 disabled:bg-gray-400"
                  disabled={!postText.trim() && !postImage}
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Linimasa (Timeline) */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-walnut-brown">Timeline</h2>
          <div className="mt-4 space-y-6">
            {loading ? (
              <p className="text-center text-walnut-brown">Memuat posts...</p>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-5 bg-white shadow-md rounded-xl">
                  <div className="flex items-center mb-3 gap-3">
                    <Avatar username={post.author} />
                    <div className="flex-1">
                      <Link
                        to={`/profile/${post.author}`}
                        className="font-bold text-chocolate-cosmos hover:underline"
                      >
                        {post.author}
                      </Link>
                      <div className="text-sm text-walnut-brown/70">
                        {formatTimestamp(post.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {post.text_content && (
                    <p className="text-gray-800 whitespace-pre-wrap">{post.text_content}</p>
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
              <div className="py-16 text-center bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-walnut-brown">
                  Belum ada postingan
                </h3>
                <p className="mt-2 text-gray-500">
                  Jadilah yang pertama untuk memulai percakapan!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default DashboardPage;