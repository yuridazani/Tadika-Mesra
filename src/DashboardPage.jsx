import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from './UserLayout';

const Avatar = ({ username }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return (
    <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-beaver">
      {initial}
    </div>
  );
};

function DashboardPage({ user, onLogout, onCreatePost, posts }) {
  const [postText, setPostText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePostSubmit = (event) => {
    event.preventDefault();
    if (!postText.trim()) {
      alert('Post tidak boleh kosong!');
      return;
    }
    onCreatePost({ text: postText });
    setPostText('');
  };

  if (!user) return null;

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
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white transition-transform duration-300 transform bg-chocolate-cosmos rounded-full hover:scale-105 disabled:bg-gray-400"
                  disabled={!postText.trim()}
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-walnut-brown">Timeline</h2>
          <div className="mt-4 space-y-6">
            {posts.length > 0 ? (
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
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
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