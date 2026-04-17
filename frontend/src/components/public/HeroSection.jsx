import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import heroBg from '../../assets/hero-bg.jpg';

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

const HeroSection = ({ onFindHostels }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal]         = useState(false);
  const [showSubModal, setShowSubModal]   = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const isOwner      = user?.role === 'Owner';
  const ownerStatus  = user?.status_label;

  const { data: subData } = useQuery({
    queryKey: ['owner-subscription'],
    queryFn: () => apiClient.get('/owner/subscription').then((r) => r.data),
    enabled: isOwner,
  });

  const hasActiveSub = subData?.subscription?.status?.label === 'Active';

  const handleListProperty = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (isOwner) {
      if (ownerStatus === 'Suspended' || ownerStatus === 'Blacklisted') {
        setShowRestrictedModal(true);
      } else if (hasActiveSub) {
        navigate('/owner/hostels/new');
      } else {
        setShowSubModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {showModal          && <GuestModal onClose={() => setShowModal(false)} />}
      {showSubModal       && <SubscriptionModal onClose={() => setShowSubModal(false)} onSubscribe={() => navigate('/owner/subscription')} />}
      {showRestrictedModal && <AccountRestrictedModal status={ownerStatus} onClose={() => setShowRestrictedModal(false)} />}

      <section className="relative overflow-hidden">
        {/* Layer 1 — Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />

        {/* Layer 2 — Dot pattern (subtle texture) */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Layer 3 — Content (topmost) */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl -ml-2 sm:-ml-4 bg-black/40 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-600/40 text-teal-200 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              Verified Hostels Across Yangon
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 drop-shadow-lg">
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Hostel in Yangon
              </span>
            </h1>

            <p className="text-lg text-teal-100/90 mb-8 max-w-xl drop-shadow">
              Affordable, licensed, and verified hostels for students, workers, and travelers.
              Search by location, type, and budget — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onFindHostels}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-800 font-semibold rounded-xl hover:bg-teal-50 transition shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find a Hostel
              </button>
              <button
                onClick={handleListProperty}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700/60 border border-teal-500/40 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                List Your Property
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
