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

const TYPE_COLORS = {
  KBZPay:         'bg-blue-50   text-blue-700   border-blue-200',
  WaveMoney:      'bg-purple-50 text-purple-700 border-purple-200',
  'Bank Transfer': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Cash:           'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PAYMENT_STATUS_COLORS = {
  'Pending Review': 'text-amber-600',
  Verified:         'text-green-600',
  Rejected:         'text-red-500',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const PaymentRow = ({ p, idx }) => {
  const isAdv    = !!p.is_advance;
  const method   = p.payment_method ?? 'Unknown';
  const colorCls = TYPE_COLORS[method] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  const label    = isAdv ? 'Advance' : `Payment #${idx + 1}`;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-xs ${
      isAdv ? 'border-purple-100 bg-purple-50/30' : 'border-gray-100 bg-gray-50'
    }`}>
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${colorCls}`}>{method}</span>
        {isAdv && (
          <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">Paid Ahead</span>
        )}
      </div>
      <div className="flex-1 min-w-0 text-gray-500">
        {label} · <span className="text-gray-400">{fmtDate(p.created_at)}</span>
      </div>
      <span className={`font-semibold flex-shrink-0 ${PAYMENT_STATUS_COLORS[p.status?.label] ?? 'text-gray-500'}`}>
        {p.status?.label}
      </span>
    </div>
  );
};

const TABS = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];

const ManageRenters = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]       = useState('All');
  const [actionMsg, setActionMsg]       = useState('');
  const [actionErr, setActionErr]       = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelErr, setCancelErr]       = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: bookingService.getOwnerBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => bookingService.ownerCancelBooking(bookingId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      setActionMsg(data.message ?? 'Booking cancelled.');
      setActionErr('');
      setCancelTarget(null);
      setCancelReason('');
      setCancelErr('');
    },
    onError: (err) => {
      setCancelErr(err?.response?.data?.message ?? 'Could not cancel booking.');
    },
  });

  const cashMutation = useMutation({
    mutationFn: (bookingId) => paymentService.recordCash(bookingId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      setActionMsg(data.message ?? 'Cash payment recorded.');
      setActionErr('');
    },
    onError: (err) => {
      setActionErr(err?.response?.data?.message ?? 'Action failed.');
      setActionMsg('');
    },
  });

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status?.label === activeTab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? bookings.length : bookings.filter((b) => b.status?.label === t).length;
    return acc;
  }, {});

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Manage Bookings</h1>
        <p className="text-sm text-gray-400 mt-0.5">All bookings across your properties</p>
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition
              ${activeTab === t ? 'bg-teal-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
          >
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${activeTab === t ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const hostel  = booking.bed?.room?.hostel;
            const total   = Number(booking.locked_price) * Number(booking.stay_duration);
            const statusLabel = booking.status?.label;
            const isPending   = statusLabel === 'Pending';
            const canCancel   = isPending;
            const hasPendingCash = booking.payments?.some(
              (p) => p.type === 'Cash' && p.status?.label === 'Pending Review'
            );

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-teal-700">
                        {booking.guest?.full_name?.charAt(0) ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{booking.guest?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{booking.guest?.phone_number}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status?.label] ?? 'bg-gray-100 text-gray-600'}`}>
                    {booking.status?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Hostel</p>
                    <p className="font-medium text-gray-700 truncate">{hostel?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Room / Bed</p>
                    <p className="font-medium text-gray-700">{booking.bed?.room?.label} — Bed {booking.bed?.bed_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Check-in</p>
                    <p className="font-medium text-gray-700">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Total</p>
                    <p className="font-bold text-teal-600">{total.toLocaleString()} MMK</p>
                  </div>
                </div>

                {booking.payments?.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Payments</p>
                    {booking.payments.map((p, idx) => (
                      <PaymentRow key={p.id} p={p} idx={idx} />
                    ))}
                  </div>
                )}

                {statusLabel === 'Cancelled' && (
                  <div className="mb-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Cancellation Info</p>
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 italic">
                      {booking.cancelled_by === 'owner'
                        ? <>Cancellation by you{booking.cancel_reason ? <>: &ldquo;{booking.cancel_reason}&rdquo;</> : '.'}</>
                        : <>Cancellation by the guest{booking.cancel_reason ? <>: &ldquo;{booking.cancel_reason}&rdquo;</> : '.'}</>}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  {isPending && hasPendingCash && (
                    <button
                      disabled={cashMutation.isPending}
                      onClick={() => cashMutation.mutate(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Record Cash Payment
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => { setCancelTarget(booking); setCancelReason(''); setCancelErr(''); }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition border border-red-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Booking
                    </button>
                  )}
                  {!isPending && <button
                    onClick={() => setReportTarget({ id: booking.guest?.id, name: booking.guest?.full_name })}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold rounded-xl transition border border-orange-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Renter
                  </button>}
                </div>
              </div>
            );
          })}
        </div>
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

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Cancel Booking</h2>
              <button onClick={() => setCancelTarget(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are cancelling the booking of <span className="font-semibold text-gray-900">{cancelTarget.guest?.full_name}</span>.
                This will vacate the bed immediately.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why you are cancelling this booking…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              {cancelErr && <p className="text-xs text-red-500">{cancelErr}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setCancelTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Back
                </button>
                <button
                  disabled={cancelMutation.isPending || !cancelReason.trim()}
                  onClick={() => cancelMutation.mutate({ bookingId: cancelTarget.id, reason: cancelReason })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition">
                  {cancelMutation.isPending && (
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
        </div>
      )}
    </div>
  );
};

export default ManageRenters;
