import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Impor icon 'LayoutDashboard'
import { LogOut, Shield, LayoutDashboard } from 'lucide-react';

function AdminLayout({ user, onLogout, children }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white-smoke font-lato">
      <nav className="sticky top-0 z-50 w-full p-4 bg-white shadow-md">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          
          <Link to="/admin" className="flex items-center gap-3 text-2xl font-bold font-playfair text-chocolate-cosmos">
            <Shield size={24} />
            <span>Admin Panel</span>
          </Link>

          <div className="flex items-center gap-6">
           <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 font-semibold transition-colors text-walnut-brown hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full p-4 py-8 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;