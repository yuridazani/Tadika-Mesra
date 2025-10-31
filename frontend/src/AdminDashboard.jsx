import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { API_URL } from './apiConfig'; 
import { Trash2, Edit, X, Save } from 'lucide-react'; 
import { io } from "socket.io-client"; 

// --- Komponen Modal Edit User (Tidak ada perubahan) ---
const EditUserModal = ({ user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: '', 
    is_admin: user.is_admin,
  });
  const token = localStorage.getItem('app_token');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    try {
      const response = await axios.put(`${API_URL}/admin/users/${user.id}`, dataToSubmit, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUserUpdated(response.data);
      onClose(); 
      alert('User berhasil diupdate!');
    } catch (error) {
      console.error('Gagal update user:', error);
      alert('Gagal update user: ' + (error.response?.data?.message || 'Error'));
    }
  };

  return (
    // ... JSX Modal tidak berubah ...
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold font-playfair text-chocolate-cosmos">
            Edit User: {user.username}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="block text-sm font-semibold text-walnut-brown">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-walnut-brown">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-walnut-brown">
              Password Baru (Kosongkan jika tidak ganti)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_admin"
              id="is_admin_checkbox"
              checked={formData.is_admin}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="is_admin_checkbox" className="font-semibold text-walnut-brown">
              Jadikan Admin?
            </label>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- Akhir Komponen Modal ---


function AdminDashboard({ currentUser, onLogout }) { 
  const navigate = useNavigate();
  
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); 
  const token = localStorage.getItem('app_token'); 

  // Efek untuk mengambil data awal (HTTP)
  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      navigate('/dashboard');
    } else {
      fetchAdminData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, navigate]);

  // Efek untuk koneksi real-time (WebSocket)
  useEffect(() => {
    if (!currentUser) return; 

    const socket = io();

    socket.on('new_post', (newPost) => {
      setAllPosts((currentPosts) => [newPost, ...currentPosts]);
    });

    // --- HAPUS LISTENER post_deleted ---
    // socket.on('post_deleted', (data) => {
    //   setAllPosts((currentPosts) =>
    //     currentPosts.filter(post => post.id !== data.postId)
    //   );
    // });
    // ----------------------------------

    return () => {
      socket.disconnect();
    };
  }, [currentUser]); 


  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersResponse, postsResponse] = await Promise.all([
        axios.get(`${API_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/posts`)
      ]);
      setAllUsers(usersResponse.data);
      setAllPosts(postsResponse.data);
    } catch (error) {
      console.error("Gagal mengambil data admin:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PERBAIKAN DI SINI ---
  const handleDeletePost = async (postId) => {
    if (window.confirm('Anda yakin ingin menghapus postingan ini? Tindakan ini tidak bisa dibatalkan.')) {
      try {
        // 1. Kirim permintaan ke server
        await axios.delete(`${API_URL}/admin/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // 2. SETELAH SUKSES, perbarui state secara manual
        setAllPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
        
      } catch (error) {
        console.error('Gagal menghapus post:', error);
        alert('Gagal menghapus post: ' + (error.response?.data?.message || 'Error'));
      }
    }
  };

  // --- PERBAIKAN DI SINI ---
  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Anda yakin ingin MENGHAPUS user "${username}"? \n\nSemua postingan mereka juga akan terhapus. Tindakan ini tidak bisa dibatalkan!`)) {
      try {
        // 1. Kirim permintaan ke server
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 2. SETELAH SUKSES, perbarui state secara manual
        setAllUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        setAllPosts(currentPosts => currentPosts.filter(post => post.author !== username));
        
        alert(`User "${username}" berhasil dihapus.`);

      } catch (error) {
        console.error('Gagal menghapus user:', error);
        alert('Gagal menghapus user: ' + (error.response?.data?.message || 'Error'));
      }
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setAllUsers(currentUsers => 
      currentUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };


  if (!currentUser || !currentUser.is_admin) {
    return null;
  }

  const formatTimestamp = (date) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <AdminLayout user={currentUser} onLogout={onLogout}>
      
      {editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      <h1 className="mb-6 text-4xl font-bold font-playfair text-chocolate-cosmos">
        Admin Panel
      </h1>
      
      {loading ? (
        <p className="text-center text-walnut-brown">Memuat data admin...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-walnut-brown">
              Daftar Semua User ({allUsers.length})
            </h2>
            <ul className="mt-4 space-y-3">
              {allUsers.map((user) => (
                <li
                  key={user.username}
                  className="flex items-center justify-between p-3 bg-white-smoke rounded-md border border-beaver/20"
                >
                  <div>
                    <span className="font-bold text-black-custom">
                      {user.username} {user.is_admin && '👑'}
                    </span>{' '}
                    - <span className="text-walnut-brown">{user.email}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                      title="Edit user"
                      disabled={currentUser.id === user.id}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-md disabled:text-gray-400 disabled:hover:bg-transparent"
                      title={currentUser.id === user.id ? "Anda tidak bisa menghapus akun Anda sendiri" : "Hapus user"}
                      disabled={currentUser.id === user.id} 
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-walnut-brown">
              Semua Postingan ({allPosts.length})
            </h2>
            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {allPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative p-4 border rounded-lg border-beaver/30 bg-white-smoke/50"
                >
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-3 right-3 p-1 text-walnut-brown/50 hover:text-red-600 hover:bg-red-100 rounded-full"
                    title="Hapus postingan (Admin)"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="items-center mb-2">
                    <Link
                      to={`/profile/${post.author}`}
                      className="font-bold text-chocolate-cosmos hover:underline"
                    >
                      {post.author}
                    </Link>
                    <div className="ml-auto text-xs text-walnut-brown/70">
                      {formatTimestamp(post.created_at)}
                    </div>
                  </div>
                  {post.text_content && (
                    <p className="text-black-custom whitespace-pre-wrap">
                      {post.text_content}
                    </p>
                  )}
                  {post.image_url && (
                    <div className="mt-2">
                      <img
                        src={post.image_url}
                        alt="Lampiran post"
                        className="object-contain w-full h-auto bg-gray-100 rounded-lg max-h-60"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;