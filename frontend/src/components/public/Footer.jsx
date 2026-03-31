import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GuestModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Owner Account Required</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        You need to create an owner account to proceed!<br />
        Please register a new account with the <span className="font-semibold text-teal-600">Hostel Owner</span> role.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/register"
          className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition text-sm"
        >
          Create Owner Account
        </Link>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);

  const isOwner = user?.role === 'Owner';

  const handleOwnerLogin = () => {
    if (isAuthenticated && isOwner) navigate('/owner/hostels');
    else navigate('/login');
  };

  const handleRegisterProperty = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isOwner) { navigate('/owner/hostels/new'); return; }
    setShowGuestModal(true);
  };

  return (
  <>
    {showGuestModal && <GuestModal onClose={() => setShowGuestModal(false)} />}
  <footer id="contact" className="bg-gray-900 text-gray-400">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div>
          <div className="mb-4">
            <span className="text-white font-bold text-base">Yangon Focus</span>
          </div>
          <p className="text-sm leading-relaxed">
            Myanmar's trusted hostel discovery platform. We connect verified hostel owners
            with tenants looking for safe, affordable accommodation in Yangon.
          </p>
        </div>

        <div id="about">
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-teal-400 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-teal-400 transition">About</Link></li>
            <li><a href="#results" className="hover:text-teal-400 transition">Browse Hostels</a></li>
            <li>
              <button onClick={handleOwnerLogin} className="hover:text-teal-400 transition text-left">
                Owner Login
              </button>
            </li>
            <li>
              <button onClick={handleRegisterProperty} className="hover:text-teal-400 transition text-left">
                Register Property
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@yangoonfocus.mm
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +95 9 765 432 189
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Yangon, Myanmar
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>&copy; {new Date().getFullYear()} Yangon Focus. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-teal-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-teal-400 transition">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
  </>
  );
};

export default Footer;
