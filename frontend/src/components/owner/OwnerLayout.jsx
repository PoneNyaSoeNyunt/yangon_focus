import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerSidebar from './OwnerSidebar';

const OwnerLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const isSuspended = user?.user_status_id === 2;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="hidden lg:flex flex-shrink-0">
        <OwnerSidebar />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-50 flex flex-shrink-0">
            <OwnerSidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 text-sm">Yangon Focus — Owner</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {isSuspended && (
            <div className="flex items-start gap-3 bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-sm text-yellow-800">
              <span className="text-base leading-tight flex-shrink-0">⚠️</span>
              <p className="flex-1 leading-snug">
                Your Owner Account is suspended. You can manage current bookings, but you cannot add new properties or edit existing listings.
              </p>
              <Link
                to="/contact"
                className="flex-shrink-0 px-3 py-1 rounded-lg bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-semibold text-xs transition"
              >
                Contact Us
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
