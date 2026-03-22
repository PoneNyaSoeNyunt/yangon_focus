import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getDashboardPath = (role) => {
  if (role === 'Super Admin') return '/admin/analytics';
  if (role === 'Owner')       return '/owner/hostels';
  return '/';
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9.5L12 4l9 5.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V12h6v9" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Yangon Focus</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#about"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
              About
            </a>
            <a href="#contact"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">Hi, {user?.full_name?.split(' ')[0]}</span>
                <Link
                  to={getDashboardPath(user?.role)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 border border-gray-200 hover:border-teal-300 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <a href="#about" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-teal-50 rounded-lg">About</a>
          <a href="#contact" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-teal-50 rounded-lg">Contact</a>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath(user?.role)}
                  className="block px-3 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Login</Link>
                <Link to="/login" className="block px-3 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
