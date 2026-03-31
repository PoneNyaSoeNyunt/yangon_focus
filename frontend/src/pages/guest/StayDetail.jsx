import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import currentStayService from '../../services/currentStayService';
import bookingService from '../../services/bookingService';
import ReportModal from '../../components/shared/ReportModal';

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

const AdvancePayModal = ({ bookingId, hostelId, livePrice, onClose, onSuccess }) => {
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [file, setFile]                         = useState(null);
  const [error, setError]                       = useState('');
  const fileRef                                 = useRef(null);

  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey:  ['hostel-payment-methods', hostelId],
    queryFn:   () => bookingService.getHostelPaymentMethods(hostelId),
    enabled:   !!hostelId,
    staleTime: 5 * 60 * 1000,
  });

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const isCash         = selectedMethodId === 'cash';

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (!isCash) {
        fd.append('hostel_payment_method_id', selectedMethodId);
        if (file) fd.append('screenshot', file);
      }
      return currentStayService.submitAdvancePayment(bookingId, fd);
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError:   (err) => setError(err?.response?.data?.message ?? 'Submission failed.'),
  });

  const selectMethod = (id) => { setSelectedMethodId(id); setFile(null); setError(''); };
  const canSubmit    = isCash ? true : !!(selectedMethodId && file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Pay for Next Month</h3>
            {livePrice && (
              <p className="text-xs text-teal-600 font-semibold mt-0.5">
                {Number(livePrice).toLocaleString()} MMK
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {methodsLoading ? (
          <div className="space-y-2 mb-4">
            {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {paymentMethods.map((m) => (
              <button key={m.id} type="button" onClick={() => selectMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                  selectedMethodId === m.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                }`}>
                <div>
                  <p className="font-semibold text-gray-800 text-xs">{m.method_name}</p>
                  <p className="text-[10px] text-gray-500">{m.account_number} · {m.account_name}</p>
                </div>
              </button>
            ))}
            <button type="button" onClick={() => selectMethod('cash')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                isCash ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
              }`}>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Pay at Property</p>
                <p className="text-[10px] text-gray-500">Notify owner — pay in cash</p>
              </div>
            </button>
          </div>
        )}

        {selectedMethod && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
            <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">Send payment to:</p>
            <p className="text-sm font-bold text-teal-800">{selectedMethod.account_name}</p>
            <p className="text-sm text-teal-700 font-mono">{selectedMethod.account_number}</p>
            <button onClick={() => fileRef.current?.click()}
              className="w-full mt-1 h-16 rounded-xl border-2 border-dashed border-teal-300 flex flex-col items-center justify-center gap-1 hover:border-teal-500 transition">
              {file
                ? <span className="text-xs font-medium text-teal-600 truncate w-full px-3 text-center">{file.name}</span>
                : <span className="text-xs text-teal-500">Tap to upload screenshot *</span>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => setFile(e.target.files[0] ?? null)} />
          </div>
        )}

        {isCash && (
          <p className="text-sm text-gray-500 mb-4">
            Your advance cash payment request will be sent to the owner for confirmation.
          </p>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
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
  const [showReportModal, setShowReportModal]   = useState(false);
  const [finishError, setFinishError]           = useState('');
  const [lightboxUrl, setLightboxUrl]           = useState(null);

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

  const livePrice    = stay.live_price ?? stay.locked_price;
  const priceChanged  = Number(livePrice) !== Number(stay.locked_price);
  const total         = Number(stay.locked_price) * Number(stay.stay_duration);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start sm:items-center gap-3">
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Stay Detail</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Booking #{stay.id}</p>
        </div>
        <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-green-100 text-green-700">
          {stay.status}
        </span>
      </div>

      {/* ── Hostel Identity Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 break-words">{stay.hostel?.name}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 break-words">
              {stay.hostel?.township && <span>{stay.hostel.township} · </span>}
              {stay.hostel?.address}
            </p>
          </div>
          {stay.hostel?.type && (
            <span className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${TYPE_STYLES[stay.hostel.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {stay.hostel.type}
            </span>
          )}
        </div>

        {/* Room & Bed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Room</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {stay.room?.label ?? '—'}
                {stay.room?.type && <span className="font-normal text-gray-400"> ({stay.room.type})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Your Bed</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">Bed-{stay.bed?.bed_number ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Financial Overview ── */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-sm p-4 sm:p-5 text-white">
        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-80 mb-3 sm:mb-4">Financial Overview</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Check-in Date</p>
            <p className="text-xs sm:text-sm font-bold truncate">{stay.check_in_date ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Duration</p>
            <p className="text-xs sm:text-sm font-bold">{stay.stay_duration} month{stay.stay_duration > 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Monthly Rate</p>
            <p className="text-xs sm:text-sm font-bold truncate">{Number(livePrice).toLocaleString()} MMK</p>
            {priceChanged && (
              <p className="text-[9px] sm:text-[10px] opacity-80 mt-0.5 flex items-center gap-0.5">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rate updated by owner
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Total Amount</p>
            <p className="text-xs sm:text-sm font-bold truncate">{total.toLocaleString()} MMK</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20 space-y-3">
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Next Payment Due</p>
            <p className="text-sm sm:text-base font-extrabold truncate">{stay.next_payment_due ?? '—'}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {stay.latest_payment && (
              <span className="px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur rounded-xl text-[10px] sm:text-xs font-semibold text-center truncate">
                {stay.latest_payment.method_name} · {stay.latest_payment.status}
              </span>
            )}
            <button
              onClick={() => setShowAdvanceModal(true)}
              className="px-3 py-2 sm:py-1.5 bg-white text-teal-700 text-xs font-semibold rounded-xl hover:bg-teal-50 transition whitespace-nowrap">
              Pay for Next Month
            </button>
          </div>
        </div>
      </div>

      {/* ── Stay Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">Stay Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <InfoRow label="Booking ID"    value={`#${stay.id}`} />
          <InfoRow label="Bed Number"    value={`Bed-${stay.bed?.bed_number}`} />
          <InfoRow label="Stay Duration" value={`${stay.stay_duration} month${stay.stay_duration > 1 ? 's' : ''}`} />
        </div>
      </div>

      {/* ── Payment History ── */}
      {Array.isArray(stay.payments) && stay.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">Payment History</h3>
          <div className="space-y-2.5">
            {stay.payments.map((p, idx) => {
              const isAdv      = !!p.is_advance;
              const label      = isAdv ? 'Advance' : `Payment #${stay.payments.length - idx}`;
              const statusCls  =
                p.status === 'Verified'       ? 'bg-green-100 text-green-700' :
                p.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' :
                p.status === 'Rejected'       ? 'bg-red-100 text-red-500'     :
                'bg-gray-100 text-gray-600';
              const methodColors = {
                KBZPay:          'bg-blue-50 text-blue-700 border-blue-200',
                WaveMoney:       'bg-orange-50 text-orange-700 border-orange-200',
                'Bank Transfer': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                Cash:            'bg-emerald-50 text-emerald-700 border-emerald-200',
              };
              const methodCls = methodColors[p.payment_method] ?? 'bg-gray-50 text-gray-600 border-gray-200';
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                    isAdv ? 'border-purple-100 bg-purple-50/30' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-start gap-1 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${methodCls}`}>
                      {p.payment_method ?? 'Unknown'}
                    </span>
                    {isAdv && (
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Paid Ahead
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{label}</p>
                    <p className="text-gray-400 mt-0.5 truncate">
                      {p.paid_at}
                      {p.total_amount ? ` · ${Number(p.total_amount).toLocaleString()} MMK` : ''}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
                    {p.status ?? '—'}
                  </span>
                  {p.screenshot_url && (
                    <button
                      onClick={() => setLightboxUrl(p.screenshot_url)}
                      className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none"
                      aria-label="View receipt"
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

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 sm:mb-4">Quick Actions</h3>

        {/* Owner Contact */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Owner Contact</p>
            {stay.hostel?.owner_phone
              ? <a href={`tel:${stay.hostel.owner_phone}`} className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 transition truncate block">
                  {stay.hostel.owner_phone}
                </a>
              : <p className="text-xs sm:text-sm text-gray-400">—</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={() => { setFinishError(''); setShowFinishModal(true); }}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-xl transition border border-red-100"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="truncate">Finish Stay</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs sm:text-sm font-semibold rounded-xl transition border border-orange-100"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="truncate">Report Issue</span>
          </button>
        </div>

        {finishError && <p className="text-xs text-red-500 mt-3 break-words">{finishError}</p>}
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
          hostelId={stay.hostel?.id}
          livePrice={livePrice}
          onClose={() => setShowAdvanceModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['guest-stay-detail', id] })}
        />
      )}
      {showReportModal && (
        <ReportModal
          offenderId={stay.hostel?.owner_id}
          offenderName={stay.hostel?.name}
          offenderRole="Owner"
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {}}
        />
      )}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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

export default StayDetail;
