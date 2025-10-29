import React from 'react';
import { useParams, Link } from 'react-router-dom';

function ProfilePage({ allPosts, allUsers }) {
  const { username } = useParams();
  const profileUser = allUsers.find(u => u.username === username);
  const userPosts = allPosts.filter(post => post.author === username);
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white-smoke">
        <h1 className="text-4xl font-bold font-playfair text-chocolate-cosmos">User Not Found</h1>
        <p className="mt-2 text-walnut-brown">Profil untuk "{username}" tidak dapat ditemukan.</p>
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
          <Link to="/admin" className="text-sm font-semibold text-chocolate-cosmos hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
          <h1 className="mt-4 text-5xl font-bold font-playfair text-chocolate-cosmos">
            {profileUser.username}
          </h1>
          <p className="text-lg text-walnut-brown">{profileUser.email}</p>
        </div>
      </header>
      
      <main className="max-w-4xl p-4 mx-auto md:p-8">
        <h2 className="text-2xl font-bold text-walnut-brown">
          Semua Postingan ({userPosts.length})
        </h2>
        <div className="mt-4 space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="p-5 bg-white shadow-lg rounded-xl">
                <div className="mb-3 text-sm text-walnut-brown/70">
                  Diposting pada {formatTimestamp(post.timestamp)}
                </div>
                <p className="text-lg text-black-custom">{post.text}</p>
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