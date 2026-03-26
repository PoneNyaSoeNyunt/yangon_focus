import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import currentStayService from '../../services/currentStayService';

const TYPE_STYLES = {
  'Male Only':   'bg-blue-100 text-blue-700',
  'Female Only': 'bg-pink-100 text-pink-700',
  'Mixed':       'bg-purple-100 text-purple-700',
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value ?? '—'}</p>
  </div>
);

const StayDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: stay, isPending, isError } = useQuery({
    queryKey: ['guest-stay-detail', id],
    queryFn:  () => currentStayService.getStayDetail(id),
    enabled:  !!id,
  });

  if (isPending) {
    return (
      <div className="p-6 sm:p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (isError || !stay) {
    return (
      <div className="p-6 sm:p-8 text-center py-20">
        <p className="text-gray-500 font-medium">Stay not found.</p>
        <button
          onClick={() => navigate('/guest/current-stay')}
          className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition"
        >
          Back to My Stays
        </button>
      </div>
    );
  }

  const total = Number(stay.locked_price) * Number(stay.stay_duration);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/guest/current-stay')}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition flex-shrink-0"
          aria-label="Back"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 truncate">Stay Detail</h1>
          <p className="text-sm text-gray-400 mt-0.5">Booking #{stay.id}</p>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          {stay.status}
        </span>
      </div>

      {/* ── Hostel Identity Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{stay.hostel?.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {stay.hostel?.township && <span>{stay.hostel.township} · </span>}
              {stay.hostel?.address}
            </p>
          </div>
          {stay.hostel?.type && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[stay.hostel.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {stay.hostel.type}
            </span>
          )}
        </div>

        {/* Room & Bed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Room</p>
              <p className="text-sm font-semibold text-gray-800">
                {stay.room?.label ?? '—'}
                {stay.room?.type && <span className="font-normal text-gray-400"> ({stay.room.type})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Your Bed</p>
              <p className="text-sm font-semibold text-gray-800">Bed-{stay.bed?.bed_number ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Financial Overview ── */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-sm p-5 text-white">
        <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-4">Financial Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Check-in Date</p>
            <p className="text-sm font-bold">{stay.check_in_date ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Duration</p>
            <p className="text-sm font-bold">{stay.stay_duration} month{stay.stay_duration > 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Monthly Rate</p>
            <p className="text-sm font-bold">{Number(stay.locked_price).toLocaleString()} MMK</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Total Amount</p>
            <p className="text-sm font-bold">{total.toLocaleString()} MMK</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Next Payment Due</p>
            <p className="text-base font-extrabold">{stay.next_payment_due ?? '—'}</p>
          </div>
          {stay.latest_payment && (
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-xl text-xs font-semibold">
              {stay.latest_payment.type} · {stay.latest_payment.status}
            </span>
          )}
        </div>
      </div>

      {/* ── Stay Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Stay Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Booking ID"    value={`#${stay.id}`} />
          <InfoRow label="Bed Number"    value={`Bed-${stay.bed?.bed_number}`} />
          <InfoRow label="Stay Duration" value={`${stay.stay_duration} month${stay.stay_duration > 1 ? 's' : ''}`} />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Owner
          </button>

          <Link
            to="/guest/support"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StayDetail;
