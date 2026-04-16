import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ownerService from '../../services/ownerService';
import apiClient from '../../api/client';

const STATUS_STYLES = {
  'Draft':     'bg-gray-100 text-gray-500',
  'Published': 'bg-green-100 text-green-700',
  'Disabled':  'bg-red-100 text-red-700',
};

const HOSTEL_TYPE_ICON = {
  'Male Only':   '♂',
  'Female Only': '♀',
  'Mixed':       '⚥',
};

const HostelCard = ({ hostel, isSuspended }) => {
  const navigate = useNavigate();
  const status = hostel.listing_status?.label ?? 'Draft';
  const roomCount = hostel.rooms?.length ?? 0;
  const bedCount = hostel.rooms?.reduce((sum, r) => sum + (r.beds?.length ?? r.max_occupancy ?? 0), 0) ?? 0;
  const editPath = `/owner/hostels/edit/${hostel.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-gray-900 truncate">{hostel.name}</span>
            <span className="text-sm text-gray-400">{HOSTEL_TYPE_ICON[hostel.type]}</span>
          </div>
          <p className="text-xs text-gray-400 truncate">{hostel.address}</p>
          {hostel.township && (
            <p className="text-xs text-teal-600 font-medium mt-0.5">{hostel.township.name}</p>
          )}
        </div>
        <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-gray-900">{roomCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Room{roomCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-gray-900">{bedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Bed{bedCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {status === 'Disabled' && hostel.disable_reason && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-red-600">Admin Message</p>
              <p className="text-xs text-red-700 mt-0.5">{hostel.disable_reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Listed{' '}
          {hostel.created_at
            ? new Date(hostel.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </span>
        {status === 'Draft' && (
          <div className="relative group">
            <button
              onClick={() => !isSuspended && navigate(editPath)}
              disabled={isSuspended}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Complete Listing
            </button>
            {isSuspended && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2 py-1 rounded-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Suspended
              </span>
            )}
          </div>
        )}
        {status === 'Published' && (
          <div className="relative group">
            <button
              onClick={() => !isSuspended && navigate(editPath)}
              disabled={isSuspended}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            {isSuspended && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2 py-1 rounded-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Suspended
              </span>
            )}
          </div>
        )}
        {status === 'Disabled' && (
          <button
            onClick={() => navigate(editPath)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Update License
          </button>
        )}
      </div>
    </div>
  );
};

const SubscriptionAlert = () => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
    <div className="flex items-start gap-2 flex-1">
      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-sm text-amber-700 font-medium">
        You need to make a subscription to the platform to list your property!
      </p>
    </div>
    <Link
      to="/owner/subscription"
      className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition"
    >
      Subscribe Now
    </Link>
  </div>
);

const OwnerDashboard = () => {
  const { user } = useAuth();
  const isSuspended = user?.user_status_id === 2;

  const { data: hostels = [], isLoading, isError } = useQuery({
    queryKey: ['owner-hostels'],
    queryFn: ownerService.getHostels,
  });

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['owner-subscription'],
    queryFn: () => apiClient.get('/owner/subscription').then((r) => r.data),
  });

  const hasActiveSub = subData?.subscription?.status?.label === 'Active';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Hostels</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your hostel listings</p>
        </div>
        {isSuspended ? (
          <div className="relative group">
            <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-300 cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm opacity-60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Hostel
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Suspended
            </span>
          </div>
        ) : subLoading || hasActiveSub ? (
          <Link
            to="/owner/hostels/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Hostel
          </Link>
        ) : (
          <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-300 cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm opacity-60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Hostel
          </button>
        )}
      </div>

      {!isSuspended && !subLoading && !hasActiveSub && (
        <div className="mb-6"><SubscriptionAlert /></div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-red-400 text-sm font-medium">
          Failed to load hostels.
        </div>
      ) : hostels.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-6">
          <div>
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium text-center">No hostels yet</p>
          </div>
          {hasActiveSub && (
            <Link
              to="/owner/hostels/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List Your First Hostel
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} isSuspended={isSuspended} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
