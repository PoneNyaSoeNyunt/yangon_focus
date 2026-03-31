import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';
import reviewService from '../../services/reviewService';

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

  const totalSeconds = Math.floor(remaining / 1_000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return { expired: remaining === 0, display: `${h}:${m}:${s}` };
};

/* ── Status styles ── */
const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-500',
  Completed: 'bg-blue-100 text-blue-700',
};

/* ── Star Picker ── */
const StarPicker = ({ value, onChange }) => (
  <span className="inline-flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <svg className={`w-7 h-7 transition ${n <= value ? 'text-amber-400' : 'text-gray-200 hover:text-amber-300'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </span>
);

/* ── Review Modal ── */
const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm]   = useState({ rating: 0, service_quality: 0, hygiene_score: 0, comment: '' });
  const [error, setError] = useState('');

  const hostel = booking.bed?.room?.hostel;

  const submitMutation = useMutation({
    mutationFn: () => reviewService.submitReview(booking.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      onSuccess('Review submitted! Thank you for your feedback.');
    },
    onError: (err) => setError(err?.response?.data?.message ?? 'Submission failed.'),
  });

  const canSubmit = form.rating > 0 && form.service_quality > 0 && form.hygiene_score > 0 && form.comment.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Write a Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl text-sm">
            <p className="font-semibold text-gray-800">{hostel?.name ?? '—'}</p>
            <p className="text-gray-400 text-xs">{booking.bed?.room?.label} — Bed {booking.bed?.bed_number}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Overall Rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Service Quality</label>
              <StarPicker value={form.service_quality} onChange={(v) => setForm((f) => ({ ...f, service_quality: v }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Hygiene</label>
              <StarPicker value={form.hygiene_score} onChange={(v) => setForm((f) => ({ ...f, hygiene_score: v }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Comment <span className="text-red-400">*</span></label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              maxLength={1000}
              placeholder="Share your experience…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{form.comment.length}/1000</p>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button
              disabled={!canSubmit || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Pay Now Modal ── */
const PayNowModal = ({ booking, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const hostelId = booking.bed?.room?.hostel?.id;

  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [file, setFile]                         = useState(null);
  const [error, setError]                       = useState('');
  const fileRef                                 = useRef(null);

  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['hostel-payment-methods', hostelId],
    queryFn:  () => bookingService.getHostelPaymentMethods(hostelId),
    enabled:  !!hostelId,
    staleTime: 5 * 60 * 1000,
  });

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const isCash         = selectedMethodId === 'cash';

  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('hostel_payment_method_id', selectedMethodId);
      fd.append('screenshot', file);
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
      onSuccess('The owner has been notified. Please pay upon arrival.');
    },
    onError: (err) => setError(err?.response?.data?.message ?? 'Action failed.'),
  });

  const isPending  = uploadMutation.isPending || cashMutation.isPending;
  const canSubmit  = isCash ? true : !!(selectedMethodId && file);

  const handleSubmit = () => {
    setError('');
    if (isCash) cashMutation.mutate();
    else        uploadMutation.mutate();
  };

  const selectMethod = (id) => { setSelectedMethodId(id); setFile(null); setError(''); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Pay Now</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-3">
          {booking.bed?.room?.hostel?.name} — Bed {booking.bed?.bed_number}
        </p>

        {methodsLoading ? (
          <div className="space-y-2 mb-4">
            {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {paymentMethods.map((m) => (
              <button key={m.id} type="button" onClick={() => selectMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                  selectedMethodId === m.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                }`}>
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{m.method_name}</p>
                  <p className="text-xs text-gray-500">{m.account_number} · {m.account_name}</p>
                </div>
              </button>
            ))}
            <button type="button" onClick={() => selectMethod('cash')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                isCash ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
              }`}>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Pay at Property</p>
                <p className="text-xs text-gray-500">Notify owner — pay in cash upon arrival</p>
              </div>
            </button>
          </div>
        )}

        {selectedMethod && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-teal-700">Send payment to:</p>
            <p className="text-sm font-bold text-teal-800">{selectedMethod.account_name}</p>
            <p className="text-sm text-teal-700 font-mono">{selectedMethod.account_number}</p>
            <p className="text-xs text-teal-600">Then upload your screenshot:</p>
            <input type="file" accept="image/*" ref={fileRef} onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-100 file:text-teal-700 file:font-medium hover:file:bg-teal-200" />
          </div>
        )}

        {isCash && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            Clicking Confirm will notify the owner. Please pay in cash upon arrival.
          </div>
        )}

        {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button disabled={!canSubmit || isPending} onClick={handleSubmit}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
              isCash ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-500 hover:bg-teal-600'
            }`}>
            {isPending ? 'Processing…' : isCash ? 'Confirm' : 'Submit Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Booking Card ── */
const BookingCard = ({ booking, onPayNow, onCancel, cancelling, onReview }) => {
  const queryClient = useQueryClient();
  const handleExpired = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['guest-bookings'] }),
    [queryClient]
  );
  const { expired, display } = useCountdown(booking.expires_at, handleExpired);

  const isPending    = booking.status_label === 'Pending';
  const isCompleted  = booking.status_label === 'Completed';
  const isCancelled  = booking.status_label === 'Cancelled';
  const total        = Number(booking.locked_price) * Number(booking.stay_duration);
  const hostel       = booking.bed?.room?.hostel;
  const latestPayment = booking.payments?.[0];
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason]   = useState('');

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
            <div className="bg-red-50 rounded-xl px-3 py-3 text-sm space-y-2">
              <p className="text-red-600 font-semibold text-xs">Cancel this booking?</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Reason for cancelling (optional)…"
                className="w-full px-2.5 py-2 rounded-xl border border-red-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setConfirmCancel(false); setCancelReason(''); }} className="text-gray-400 hover:text-gray-600 text-xs px-3 py-1">No</button>
                <button disabled={cancelling} onClick={() => { onCancel(booking.id, cancelReason); setConfirmCancel(false); setCancelReason(''); }}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition">
                  {cancelling ? '…' : 'Yes, cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Cancellation Info</p>
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 italic">
            {booking.cancelled_by === 'owner'
              ? <>Cancellation by the hostel owner{booking.cancel_reason ? <>: &ldquo;{booking.cancel_reason}&rdquo;</> : '.'}</>  
              : <>Cancellation by you{booking.cancel_reason ? <>: &ldquo;{booking.cancel_reason}&rdquo;</> : '.'}</>}
          </p>
        </div>
      )}

      {isCompleted && (
        <div className="pt-3 border-t border-gray-100">
          {booking.has_review ? (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Review submitted
            </p>
          ) : (
            <button
              onClick={() => onReview(booking)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition">
              Write Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Page ── */
const MyBookings = () => {
  const queryClient                   = useQueryClient();
  const [payTarget, setPayTarget]     = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [toast, setToast]             = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['guest-bookings'],
    queryFn:  bookingService.getGuestBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingService.cancelBooking(id, reason || null),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      setToast('Booking cancelled.');
    },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
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
              onCancel={(id, reason) => cancelMutation.mutate({ id, reason })}
              cancelling={cancelMutation.isPending}
              onReview={setReviewTarget}
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

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={(msg) => { setReviewTarget(null); setToast(msg); }}
        />
      )}
    </div>
  );
};

export default MyBookings;
