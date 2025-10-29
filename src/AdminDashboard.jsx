
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

function AdminDashboard({ currentUser, allUsers, allPosts, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.username !== 'admin') {
      console.log('Akses ditolak. Mengalihkan ke dashboard...');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.username !== 'admin') {
    return null;
  }

  const formatTimestamp = (date) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <AdminLayout user={currentUser} onLogout={onLogout}>
      <h1 className="mb-6 text-4xl font-bold font-playfair text-chocolate-cosmos">
        Admin Panel
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-walnut-brown">
            Daftar Semua User ({allUsers.length})
          </h2>
          <ul className="mt-4 space-y-3 list-disc list-inside">
            {allUsers.map((user) => (
              <li
                key={user.username}
                className="p-3 bg-white-smoke rounded-md border border-beaver/20"
              >
                <span className="font-bold text-black-custom">
                  {user.username}
                </span>{' '}
                - <span className="text-walnut-brown">{user.email}</span>
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
                className="p-4 border rounded-lg border-beaver/30 bg-white-smoke/50"
              >
                <div className="flex items-center mb-2">
                  <Link
                    to={`/profile/${post.author}`}
                    className="font-bold text-chocolate-cosmos hover:underline"
                  >
                    {post.author}
                  </Link>
                  <div className="ml-auto text-xs text-walnut-brown/70">
                    {formatTimestamp(post.timestamp)}
                  </div>
                </div>
                <p className="text-black-custom whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
