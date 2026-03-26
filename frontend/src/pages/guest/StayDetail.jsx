import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const FinishModal = ({ onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 text-center mb-1">Finish Your Stay Early?</h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        Are you sure you want to end your stay early? This will vacate your bed immediately.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60">
          {isLoading ? 'Processing…' : 'Yes, Finish Stay'}
        </button>
      </div>
    </div>
  </div>
);

const AdvancePayModal = ({ bookingId, onClose, onSuccess }) => {
  const [method, setMethod]               = useState('screenshot');
  const [file, setFile]                   = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError]                 = useState('');
  const fileRef                           = useRef(null);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (method === 'screenshot' && file) fd.append('screenshot', file);
      if (transactionId) fd.append('transaction_id', transactionId);
      return currentStayService.submitAdvancePayment(bookingId, fd);
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(err?.response?.data?.message ?? 'Submission failed.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Pay for Next Month</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {['screenshot', 'cash'].map((m) => (
            <button key={m} onClick={() => setMethod(m)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${method === m ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {m === 'screenshot' ? 'Upload Screenshot' : 'Pay at Property'}
            </button>
          ))}
        </div>

        {method === 'screenshot' && (
          <div className="space-y-3 mb-4">
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-teal-400 transition">
              {file
                ? <span className="text-xs font-medium text-teal-600 px-2 text-center truncate w-full px-4">{file.name}</span>
                : <>
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400">Tap to upload screenshot</span>
                  </>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => setFile(e.target.files[0] ?? null)} />
            <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Transaction ID (optional)"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400" />
          </div>
        )}

        {method === 'cash' && (
          <p className="text-sm text-gray-500 mb-4">
            Your advance cash payment request will be sent to the owner for confirmation.
          </p>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || (method === 'screenshot' && !file)}
          className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
          {mutation.isPending ? 'Submitting…' : 'Submit Payment'}
        </button>
      </div>
    </div>
  );
};

const StayDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFinishModal, setShowFinishModal]   = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [finishError, setFinishError]           = useState('');

  const finishMutation = useMutation({
    mutationFn: () => currentStayService.finishStay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-current-stays'] });
      navigate('/guest/current-stay');
    },
    onError: (err) => setFinishError(err?.response?.data?.message ?? 'Could not finish stay.'),
  });

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
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Next Payment Due</p>
            <p className="text-base font-extrabold">{stay.next_payment_due ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stay.latest_payment && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-xl text-xs font-semibold">
                {stay.latest_payment.type} · {stay.latest_payment.status}
              </span>
            )}
            <button
              onClick={() => setShowAdvanceModal(true)}
              className="px-3 py-1.5 bg-white text-teal-700 text-xs font-semibold rounded-xl hover:bg-teal-50 transition">
              Pay for Next Month
            </button>
          </div>
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

        {/* Owner Contact */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Owner Contact</p>
            {stay.hostel?.owner_phone
              ? <a href={`tel:${stay.hostel.owner_phone}`} className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition">
                  {stay.hostel.owner_phone}
                </a>
              : <p className="text-sm text-gray-400">—</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setFinishError(''); setShowFinishModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Finish Stay
          </button>

          <Link
            to="/guest/support"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-semibold rounded-xl transition border border-orange-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </Link>
        </div>

        {finishError && <p className="text-xs text-red-500 mt-3">{finishError}</p>}
      </div>

      {/* ── Modals ── */}
      {showFinishModal && (
        <FinishModal
          isLoading={finishMutation.isPending}
          onConfirm={() => finishMutation.mutate()}
          onCancel={() => setShowFinishModal(false)}
        />
      )}
      {showAdvanceModal && (
        <AdvancePayModal
          bookingId={id}
          onClose={() => setShowAdvanceModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['guest-stay-detail', id] })}
        />
      )}
    </div>
  );
};

export default StayDetail;
