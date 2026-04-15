import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import ReportModal from '../../components/shared/ReportModal';

const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-500',
  Completed: 'bg-blue-100 text-blue-700',
};

const METHOD_COLORS = {
  KBZPay:          'bg-blue-50 text-blue-700 border-blue-200',
  WaveMoney:       'bg-purple-50 text-purple-700 border-purple-200',
  'Bank Transfer': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Cash:            'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PAY_STATUS_CLS = {
  'Pending Review': 'bg-amber-100 text-amber-700',
  Verified:         'bg-green-100 text-green-700',
  Rejected:         'bg-red-100 text-red-500',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/* ── Card for the grid ── */
const BookingCard = ({ booking, onView }) => {
  const statusLabel = booking.status?.label ?? 'Unknown';
  const hostel      = booking.bed?.room?.hostel;
  const total       = Number(booking.locked_price) * Number(booking.stay_duration);
  const latestPay   = booking.payments?.find(p => p.screenshot_url);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div
        className="relative h-40 bg-gray-100 cursor-pointer group"
        onClick={() => onView(booking)}
      >
        {latestPay?.screenshot_url ? (
          <img src={latestPay.screenshot_url} alt="Payment screenshot" className="w-full h-full object-cover group-hover:opacity-90 transition" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
          <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow">Quick View</span>
        </div>
        <span className={`absolute top-2 right-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-teal-700">{booking.guest?.full_name?.charAt(0) ?? '?'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{booking.guest?.full_name ?? 'Unknown'}</p>
            <p className="text-xs text-gray-400 truncate">{booking.guest?.phone_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Hostel</p>
            <p className="text-sm text-gray-700 truncate">{hostel?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Check-in</p>
            <p className="text-sm text-gray-700">{fmtDate(booking.check_in_date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Room / Bed</p>
            <p className="text-sm text-gray-700 truncate">{booking.bed?.room?.label} — Bed {booking.bed?.bed_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-sm font-bold text-teal-600">{total.toLocaleString()} MMK</p>
          </div>
        </div>

        <div className="mt-auto pt-1">
          <button
            onClick={() => onView(booking)}
            className="w-full text-center text-xs font-semibold text-teal-600 hover:text-teal-700 py-1.5 rounded-lg hover:bg-teal-50 transition"
          >
            View & Take Action
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Reject sub-modal ── */
const RejectPaymentModal = ({ onConfirm, onCancel, isPending }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Reject Payment</h3>
        <p className="text-sm text-gray-500 mb-4">Provide an optional reason for rejection.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection (optional)..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={() => onConfirm(reason || null)}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
          >
            {isPending ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Detail modal (like LicenseVerification) ── */
const BookingDetailModal = ({ booking, onClose, onVerify, onReject, onCancel, onRecordCash, onReport, isVerifying, isRejecting, isCancelling, isCashing }) => {
  const [lightboxUrl, setLightboxUrl]     = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason]     = useState('');
  const [cancelErr, setCancelErr]           = useState('');

  const statusLabel = booking.status?.label ?? 'Unknown';
  const isPending   = statusLabel === 'Pending';
  const hostel      = booking.bed?.room?.hostel;
  const total       = Number(booking.locked_price) * Number(booking.stay_duration);
  const pendingPayments = (booking.payments ?? []).filter(p => p.status?.label === 'Pending Review' && p.screenshot_url);
  const hasPendingCash  = booking.payments?.some(p => p.payment_method === 'Cash' && p.status?.label === 'Pending Review');
  const hasActivePayment = booking.payments?.some(p => p.status?.label === 'Pending Review' || p.status?.label === 'Verified');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Booking Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">{booking.guest?.full_name} · {hostel?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Screenshot preview */}
          {pendingPayments.length > 0 && (
            <div className="p-6 pb-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Payment Screenshot</p>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer group"
                style={{ minHeight: '180px' }}
                onClick={() => setLightboxUrl(pendingPayments[0].screenshot_url)}
              >
                <img src={pendingPayments[0].screenshot_url} alt="Payment screenshot"
                  className="w-full max-h-64 object-contain group-hover:opacity-90 transition" />
              </div>
            </div>
          )}

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Guest</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.guest?.full_name ?? '—'}</p>
                <p className="text-xs text-gray-400 font-mono">{booking.guest?.phone_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hostel</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{hostel?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Room / Bed</p>
                <p className="text-sm text-gray-700 mt-0.5">{booking.bed?.room?.label} — Bed {booking.bed?.bed_number}</p>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Check-in</p>
                <p className="text-sm text-gray-700 mt-0.5">{fmtDate(booking.check_in_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Duration / Total</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {booking.stay_duration} month{booking.stay_duration > 1 ? 's' : ''} · <span className="text-teal-600">{total.toLocaleString()} MMK</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Booking Status</p>
                <span className={`inline-flex mt-0.5 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Payments section */}
            {booking.payments?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Payment History</p>
                <div className="space-y-2">
                  {booking.payments.map((p, idx) => {
                    const method = p.payment_method ?? 'Unknown';
                    const mCls   = METHOD_COLORS[method] ?? 'bg-gray-50 text-gray-600 border-gray-200';
                    const sCls   = PAY_STATUS_CLS[p.status?.label] ?? 'bg-gray-100 text-gray-500';
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${mCls}`}>{method}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{p.is_advance ? 'Advance' : `Payment #${idx + 1}`}</p>
                          <p className="text-gray-400 mt-0.5">{fmtDateTime(p.created_at)}{p.total_amount ? ` · ${Number(p.total_amount).toLocaleString()} MMK` : ''}</p>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sCls}`}>{p.status?.label}</span>
                        {p.screenshot_url && (
                          <button
                            onClick={() => setLightboxUrl(p.screenshot_url)}
                            className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none"
                          >
                            <img src={p.screenshot_url} alt="receipt" className="w-full h-full object-cover" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancellation info */}
            {statusLabel === 'Cancelled' && (
              <div className="sm:col-span-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Cancellation Reason</p>
                <p className="text-sm text-red-700">
                  {booking.cancelled_by === 'owner' ? 'Cancelled by you' : 'Cancelled by the guest'}
                  {booking.cancel_reason ? `: "${booking.cancel_reason}"` : '.'}
                </p>
                {booking.updated_at && (
                  <p className="text-[10px] text-red-400">
                    {fmtDateTime(booking.updated_at)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2">
          {/* Verify / Reject pending digital payments */}
          {pendingPayments.map((p) => (
            <div key={p.id} className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isRejecting}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => onVerify(p.id)}
                disabled={isVerifying}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve Payment
              </button>
            </div>
          ))}

          {/* Record cash */}
          {isPending && hasPendingCash && (
            <button
              disabled={isCashing}
              onClick={() => onRecordCash(booking.id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Record Cash
            </button>
          )}

          {/* Cancel booking */}
          {isPending && !hasActivePayment && (
            <button
              onClick={() => { setShowCancelForm(true); setCancelReason(''); setCancelErr(''); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition border border-red-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Booking
            </button>
          )}

          {/* Report */}
          {!isPending && (
            <button
              onClick={() => { onClose(); setTimeout(() => onReport({ id: booking.guest?.id, name: booking.guest?.full_name }), 100); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-semibold rounded-xl transition border border-orange-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Renter
            </button>
          )}
        </div>
      </div>

      {/* Reject sub-modal */}
      {showRejectForm && (
        <RejectPaymentModal
          onConfirm={(reason) => { setShowRejectForm(false); onReject(pendingPayments[0]?.id, reason); }}
          onCancel={() => setShowRejectForm(false)}
          isPending={isRejecting}
        />
      )}

      {/* Cancel booking sub-modal */}
      {showCancelForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cancelling <span className="font-semibold text-gray-900">{booking.guest?.full_name}</span>'s booking will vacate the bed.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {cancelErr && <p className="mt-2 text-xs text-red-500">{cancelErr}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCancelForm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Back</button>
              <button
                disabled={isCancelling || !cancelReason.trim()}
                onClick={() => {
                  onCancel(booking.id, cancelReason, {
                    onSuccess: () => setShowCancelForm(false),
                    onError: (msg) => setCancelErr(msg),
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {isCancelling && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="Payment receipt"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

/* ── Tabs ── */
const TABS = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];

const ManageBookings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]         = useState('All');
  const [actionMsg, setActionMsg]         = useState('');
  const [actionErr, setActionErr]         = useState('');
  const [reportTarget, setReportTarget]   = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: bookingService.getOwnerBookings,
  });

  const verifyMutation = useMutation({
    mutationFn: (paymentId) => paymentService.verifyPayment(paymentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-pending-payments'] });
      setActionMsg(data.message ?? 'Payment verified.');
      setActionErr('');
      setSelectedBooking(null);
    },
    onError: (err) => { setActionErr(err?.response?.data?.message ?? 'Verification failed.'); setActionMsg(''); },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ paymentId, reason }) => paymentService.rejectPayment(paymentId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-pending-payments'] });
      setActionMsg(data.message ?? 'Payment rejected.');
      setActionErr('');
      setSelectedBooking(null);
    },
    onError: (err) => { setActionErr(err?.response?.data?.message ?? 'Rejection failed.'); setActionMsg(''); },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => bookingService.ownerCancelBooking(bookingId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      setActionMsg(data.message ?? 'Booking cancelled.');
      setActionErr('');
      setSelectedBooking(null);
    },
    onError: (err) => { setActionErr(err?.response?.data?.message ?? 'Could not cancel booking.'); setActionMsg(''); },
  });

  const cashMutation = useMutation({
    mutationFn: (bookingId) => paymentService.recordCash(bookingId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      setActionMsg(data.message ?? 'Cash payment recorded.');
      setActionErr('');
      setSelectedBooking(null);
    },
    onError: (err) => { setActionErr(err?.response?.data?.message ?? 'Action failed.'); setActionMsg(''); },
  });

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status?.label === activeTab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? bookings.length : bookings.filter((b) => b.status?.label === t).length;
    return acc;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">All bookings across your properties</p>
        </div>
        {!isLoading && (
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{bookings.length} Bookings</span>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionMsg}
        </div>
      )}
      {actionErr && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{actionErr}</div>
      )}

      {/* Mobile: select dropdown */}
      <div className="lg:hidden mb-6">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        >
          {TABS.map((t) => (
            <option key={t} value={t}>{t}{counts[t] > 0 ? ` (${counts[t]})` : ''}</option>
          ))}
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <div className="hidden lg:flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === t
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === t ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onView={setSelectedBooking} />
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onVerify={(paymentId) => verifyMutation.mutate(paymentId)}
          onReject={(paymentId, reason) => rejectMutation.mutate({ paymentId, reason })}
          onCancel={(bookingId, reason, cbs) => cancelMutation.mutate(
            { bookingId, reason },
            {
              onSuccess: () => cbs?.onSuccess?.(),
              onError: (err) => cbs?.onError?.(err?.response?.data?.message ?? 'Could not cancel.'),
            },
          )}
          onRecordCash={(bookingId) => cashMutation.mutate(bookingId)}
          onReport={setReportTarget}
          isVerifying={verifyMutation.isPending}
          isRejecting={rejectMutation.isPending}
          isCancelling={cancelMutation.isPending}
          isCashing={cashMutation.isPending}
        />
      )}

      {reportTarget && (
        <ReportModal
          offenderId={reportTarget.id}
          offenderName={reportTarget.name}
          offenderRole="Guest"
          onClose={() => setReportTarget(null)}
          onSuccess={() => setReportTarget(null)}
        />
      )}
    </div>
  );
};

export default ManageBookings;
