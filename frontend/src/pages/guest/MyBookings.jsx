import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';

/* ── Countdown hook (MM:SS from expires_at) ── */
const useCountdown = (expiresAt, onExpired) => {
  const [remaining, setRemaining] = useState(
    () => Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);

  useEffect(() => {
    if (remaining <= 0) { onExpiredRef.current?.(); return; }
    const t = setInterval(() => {
      const r = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(r);
      if (r === 0) { clearInterval(t); onExpiredRef.current?.(); }
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const m = String(Math.floor(remaining / 60_000)).padStart(2, '0');
  const s = String(Math.floor((remaining % 60_000) / 1_000)).padStart(2, '0');
  return { expired: remaining === 0, display: `${m}:${s}` };
};

/* ── Status styles ── */
const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-500',
  Completed: 'bg-blue-100 text-blue-700',
};

/* ── Pay Now Modal ── */
const PayNowModal = ({ booking, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [step, setStep]          = useState('choose');
  const [payType, setPayType]    = useState('KBZPay');
  const [txId, setTxId]          = useState('');
  const [file, setFile]          = useState(null);
  const [error, setError]        = useState('');
  const fileRef                  = useRef();

  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('type', payType);
      fd.append('screenshot', file);
      if (txId) fd.append('transaction_id', txId);
      return bookingService.uploadPayment(booking.id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      onSuccess('Payment submitted! The owner will verify your screenshot shortly.');
    },
    onError: (err) => setError(err?.response?.data?.message ?? 'Upload failed.'),
  });

  const cashMutation = useMutation({
    mutationFn: () => bookingService.payCash(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      onSuccess('The owner has been notified. Please pay Daw Hla upon arrival.');
    },
    onError: (err) => setError(err?.response?.data?.message ?? 'Action failed.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Pay Now</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'choose' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Booking: <span className="font-semibold text-gray-700">
                {booking.bed?.room?.hostel?.name} — Bed {booking.bed?.bed_number}
              </span>
            </p>
            <button onClick={() => setStep('upload')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition text-left">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Upload Screenshot</p>
                <p className="text-xs text-gray-400">KBZPay, WaveMoney, or Bank Transfer</p>
              </div>
            </button>
            <button onClick={() => setStep('property')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Pay at Property</p>
                <p className="text-xs text-gray-400">Notify owner — pay Daw Hla upon arrival</p>
              </div>
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Method</label>
              <select value={payType} onChange={(e) => setPayType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="KBZPay">KBZPay</option>
                <option value="WaveMoney">WaveMoney</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Screenshot <span className="text-red-400">*</span></label>
              <input type="file" accept="image/*" ref={fileRef} onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Transaction ID <span className="text-gray-400">(optional)</span></label>
              <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="e.g. TXN123456"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep('choose')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Back</button>
              <button disabled={!file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-semibold transition">
                {uploadMutation.isPending ? 'Uploading…' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 'property' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-200">
              <p className="font-semibold mb-1">Pay in person at the property</p>
              <p>Clicking Confirm will notify the owner. Please pay <strong>Daw Hla</strong> directly upon arrival. Your booking remains Pending until cash is recorded by the owner.</p>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep('choose')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Back</button>
              <button disabled={cashMutation.isPending} onClick={() => cashMutation.mutate()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold transition">
                {cashMutation.isPending ? 'Sending…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Booking Card ── */
const BookingCard = ({ booking, onPayNow, onCancel, cancelling }) => {
  const queryClient = useQueryClient();
  const handleExpired = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['guest-bookings'] }),
    [queryClient]
  );
  const { expired, display } = useCountdown(booking.expires_at, handleExpired);

  const isPending    = booking.status_label === 'Pending';
  const isCancelled  = booking.status_label === 'Cancelled';
  const total        = Number(booking.locked_price) * Number(booking.stay_duration);
  const hostel       = booking.bed?.room?.hostel;
  const latestPayment = booking.payments?.[0];
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition ${isCancelled ? 'opacity-60 border-gray-100' : 'border-gray-100 hover:shadow-md'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-gray-900">{hostel?.name ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{hostel?.township} · {hostel?.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status_label] ?? 'bg-gray-100 text-gray-600'}`}>
          {booking.status_label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Room / Bed</p>
          <p className="font-medium text-gray-700">{booking.bed?.room?.label} — Bed {booking.bed?.bed_number}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Check-in</p>
          <p className="font-medium text-gray-700">{new Date(booking.check_in_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Duration</p>
          <p className="font-medium text-gray-700">{booking.stay_duration} month{booking.stay_duration > 1 ? 's' : ''}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Total</p>
          <p className="font-bold text-teal-600">{total.toLocaleString()} MMK</p>
        </div>
      </div>

      {latestPayment && (
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[latestPayment.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {latestPayment.status}
          </span>
          {latestPayment.type} payment submitted
        </div>
      )}

      {isPending && (
        <div className="pt-3 border-t border-gray-100 space-y-3">
          {!latestPayment && (
            <div className={`flex items-center gap-2 text-sm font-semibold ${expired ? 'text-red-500' : 'text-amber-600'}`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {expired ? 'Payment window expired — booking will be cancelled.' : `Time remaining to pay: ${display}`}
            </div>
          )}

          {!expired && !confirmCancel && (
            <div className="flex gap-2">
              {!latestPayment && (
                <button onClick={() => setConfirmCancel(true)}
                  className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition">
                  Cancel Booking
                </button>
              )}
              <button
                disabled={!!latestPayment}
                onClick={() => onPayNow(booking)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition">
                Pay Now
              </button>
            </div>
          )}

          {confirmCancel && (
            <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2 text-sm">
              <span className="text-red-600 flex-1">Cancel this booking?</span>
              <button onClick={() => setConfirmCancel(false)} className="text-gray-400 hover:text-gray-600 text-xs">No</button>
              <button disabled={cancelling} onClick={() => { onCancel(booking.id); setConfirmCancel(false); }}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition">
                {cancelling ? '…' : 'Yes, cancel'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Page ── */
const MyBookings = () => {
  const queryClient               = useQueryClient();
  const [payTarget, setPayTarget] = useState(null);
  const [toast, setToast]         = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['guest-bookings'],
    queryFn:  bookingService.getGuestBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingService.cancelBooking(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      setToast('Booking cancelled.');
    },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your hostel reservations</p>
        </div>
        <Link to="/" className="text-sm text-teal-600 hover:underline font-medium">Browse Hostels →</Link>
      </div>

      {toast && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toast}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 font-medium">No bookings yet.</p>
          <Link to="/" className="mt-3 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
            Find a Hostel
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPayNow={setPayTarget}
              onCancel={(id) => cancelMutation.mutate(id)}
              cancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}

      {payTarget && (
        <PayNowModal
          booking={payTarget}
          onClose={() => setPayTarget(null)}
          onSuccess={(msg) => { setPayTarget(null); setToast(msg); }}
        />
      )}
    </div>
  );
};

export default MyBookings;
