import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function Navbar() {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <header className="border-b border-gray-800 bg-ink/95 backdrop-blur sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-lg text-accent">
          <span>&gt;_</span>
          <span>ASCII Studio</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
              <Link to="/generate" className="hover:text-accent transition-colors">Generate</Link>
              <Link to="/artworks" className="hover:text-accent transition-colors">My Artworks</Link>
              <Link to="/profile" className="hover:text-accent transition-colors">
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md border border-gray-700 hover:border-accent hover:text-accent transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent transition-colors">Sign In</Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md bg-accent text-ink font-semibold hover:bg-accentDark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
