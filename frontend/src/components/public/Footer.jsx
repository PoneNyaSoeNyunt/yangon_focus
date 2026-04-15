import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

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

const AccountRestrictedModal = ({ status, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Account Restricted</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {status === 'Blacklisted'
          ? 'Your account has been permanently blacklisted. You are not permitted to list properties.'
          : 'Your account is currently suspended. Property listing is disabled. Please contact support.'}
      </p>
      <button
        onClick={onClose}
        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
      >
        Close
      </button>
    </div>
  </div>
);

const SubscriptionModal = ({ onClose, onSubscribe }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Subscription Required</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        You need to make a subscription to the platform to list your property!
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onSubscribe}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition text-sm"
        >
          Subscribe Now
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
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
  const [showGuestModal, setShowGuestModal]           = useState(false);
  const [showSubModal, setShowSubModal]               = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const isOwner     = user?.role === 'Owner';
  const ownerStatus = user?.status_label;

  const { data: subData } = useQuery({
    queryKey: ['owner-subscription'],
    queryFn: () => apiClient.get('/owner/subscription').then((r) => r.data),
    enabled: isAuthenticated && isOwner,
  });

  const hasActiveSub = subData?.subscription?.status?.label === 'Active';

  const handleOwnerLogin = () => {
    if (isAuthenticated && isOwner) navigate('/owner/hostels');
    else navigate('/login');
  };

  const handleRegisterProperty = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isOwner) {
      if (ownerStatus === 'Suspended' || ownerStatus === 'Blacklisted') {
        setShowRestrictedModal(true);
      } else if (hasActiveSub) {
        navigate('/owner/hostels/new');
      } else {
        setShowSubModal(true);
      }
      return;
    }
    setShowGuestModal(true);
  };

  return (
  <>
    {showGuestModal      && <GuestModal onClose={() => setShowGuestModal(false)} />}
    {showSubModal        && <SubscriptionModal onClose={() => setShowSubModal(false)} onSubscribe={() => { setShowSubModal(false); navigate('/owner/subscription'); }} />}
    {showRestrictedModal && <AccountRestrictedModal status={ownerStatus} onClose={() => setShowRestrictedModal(false)} />}
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
            <li><button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-teal-400 transition text-left">Home</button></li>
            <li><button onClick={() => { navigate('/about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-teal-400 transition text-left">About</button></li>
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
          <button onClick={() => { navigate('/privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-teal-400 transition">Privacy Policy</button>
          <button onClick={() => { navigate('/terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-teal-400 transition">Terms of Service</button>
        </div>
      </div>
    </div>
  </footer>
  </>
  );
};

export default Footer;
