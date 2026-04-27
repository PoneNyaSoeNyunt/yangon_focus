import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

const STATUS_STYLES = {
  'Active':               'bg-teal-100 text-teal-700',
  'Overdue':              'bg-red-100 text-red-700',
  'Pending Verification': 'bg-amber-100 text-amber-700',
};

const PAYMENT_STATUS_STYLES = {
  'Verified':       'bg-green-100 text-green-700',
  'Rejected':       'bg-red-100 text-red-700',
  'Pending Review': 'bg-amber-100 text-amber-700',
};

const Spinner = ({ sm }) => (
  <svg className={`${sm ? 'w-3.5 h-3.5' : 'w-5 h-5'} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const monthsCovered = (amount, fee) => {
  const feeNum = Number(fee);
  if (!feeNum || !amount) return 1;
  return Math.max(1, Math.round(Number(amount) / feeNum));
};

const OwnerSubscription = () => {
  const queryClient = useQueryClient();
  const [payModal, setPayModal]           = useState(false);
  const [screenshot, setScreenshot]       = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [submitError, setSubmitError]     = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const fileRef = useRef(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['owner-subscription'],
    queryFn:  () => apiClient.get('/owner/subscription').then((r) => r.data),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['owner-sub-history'],
    queryFn:  () => apiClient.get('/owner/subscription/history').then((r) => r.data),
  });

  const { data: contactInfo } = useQuery({
    queryKey: ['contact-info'],
    queryFn:  () => apiClient.get('/contact-info').then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: methodsData, isLoading: methodsLoading } = useQuery({
    queryKey: ['platform-payment-methods'],
    queryFn:  () => apiClient.get('/platform-payment-methods').then((r) => r.data),
    enabled:  payModal,
    staleTime: 1000 * 60 * 5,
  });

  const payMutation = useMutation({
    mutationFn: (formData) => apiClient.post('/owner/subscription/pay', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['owner-sub-history'] });
      setSubmitSuccess(true);
      setScreenshot(null);
      setPreviewUrl(null);
      setSubmitError('');
    },
    onError: (err) => {
      const errs = err?.response?.data?.errors;
      if (errs) {
        setSubmitError(Object.values(errs).flat().join(' '));
      } else {
        setSubmitError(err?.response?.data?.message ?? 'Submission failed. Please try again.');
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSubmitError('');
  };

  const handleSubmit = () => {
    if (!selectedMethodId) { setSubmitError('Please select a payment method.'); return; }
    if (!screenshot) { setSubmitError('Please attach a payment screenshot.'); return; }
    const fd = new FormData();
    fd.append('screenshot', screenshot);
    fd.append('platform_payment_method_id', selectedMethodId);
    payMutation.mutate(fd);
  };

  const openModal = () => {
    setPayModal(true);
    setScreenshot(null);
    setPreviewUrl(null);
    setSubmitError('');
    setSubmitSuccess(false);
    setSelectedMethodId(null);
  };

  const closeModal = () => {
    setPayModal(false);
    setSubmitSuccess(false);
    setSelectedMethodId(null);
  };

  const subscription      = subData?.subscription;
  const fee               = subData?.fee ?? '5000';
  const subscriptionUntil = subData?.subscription_until;
  const days              = subData?.days_remaining ?? daysRemaining(subscription?.end_date);
  const statusLabel       = subscription?.status?.label;
  const history        = Array.isArray(historyData) ? historyData : [];
  const activeMethods  = Array.isArray(methodsData) ? methodsData : [];

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
        <p className="text-sm text-gray-400 mt-0.5">View and manage your monthly platform subscription</p>
      </div>

      {/* Status Overview Card */}
      {subLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center gap-3 text-teal-500 mb-5">
          <Spinner /> <span className="text-sm text-gray-400">Loading subscription…</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Subscription Status</p>
                {statusLabel ? (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
                    {statusLabel}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-500">
                    No Active Subscription
                  </span>
                )}
              </div>

              {(subscriptionUntil || subscription?.end_date) && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Next Payment Due</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(subscriptionUntil ?? subscription.end_date)}</p>
                </div>
              )}

              {days !== null && statusLabel === 'Active' && (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                  days <= 3 ? 'bg-red-50 text-red-700' : days <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'
                }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {days === 0
                    ? 'Your listing expires today'
                    : `Your listing remains active for ${days} more day${days !== 1 ? 's' : ''}`}
                </div>
              )}
            </div>

            <div className="text-left">
              <p className="text-xs text-gray-400 mb-1">Monthly Fee</p>
              <p className="text-2xl font-extrabold text-teal-600 leading-tight">
                {Number(fee).toLocaleString()}
                <span className="text-sm font-medium text-gray-400 ml-1">MMK</span>
              </p>
              <button
                onClick={openModal}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Monthly Fee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Payment History</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your past subscription payments</p>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-teal-500">
            <Spinner /> <span className="text-sm text-gray-400">Loading history…</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">No payment history yet.</p>
          </div>
        ) : (
          <div className="p-4 space-y-2.5">
            {history.map((p, idx) => {
              const statusLabel = p.status?.label ?? '—';
              const statusCls =
                statusLabel === 'Verified'       ? 'bg-green-100 text-green-700' :
                statusLabel === 'Pending Review' ? 'bg-amber-100 text-amber-700' :
                statusLabel === 'Rejected'       ? 'bg-red-100 text-red-500'     :
                'bg-gray-100 text-gray-600';
              const methodColors = {
                KBZPay:          'bg-blue-50 text-blue-700 border-blue-200',
                WaveMoney:       'bg-orange-50 text-orange-700 border-orange-200',
                'Bank Transfer': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                Cash:            'bg-emerald-50 text-emerald-700 border-emerald-200',
              };
              const methodCls = methodColors[p.payment_method] ?? 'bg-gray-50 text-gray-600 border-gray-200';
              return (
                <div key={p.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                  {/* Mobile: vertical stack */}
                  <div className="flex flex-col gap-2 sm:hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">Payment #{history.length - idx}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${methodCls}`}>
                        {p.payment_method ?? 'Unknown'}
                      </span>
                      {p.total_amount && (
                        <span className="font-semibold text-gray-700">{Number(p.total_amount).toLocaleString()} MMK</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">{fmtDateTime(p.created_at)}</p>
                      {p.screenshot_url && (
                        <button
                          onClick={() => setLightboxUrl(p.screenshot_url)}
                          className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none"
                          aria-label="View receipt">
                          <img src={p.screenshot_url} alt="receipt" className="w-full h-full object-cover" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop: horizontal row */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${methodCls}`}>
                        {p.payment_method ?? 'Unknown'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">Payment #{history.length - idx}</p>
                      <p className="text-gray-400 mt-0.5 truncate">
                        {fmtDateTime(p.created_at)}
                        {p.total_amount ? ` · ${Number(p.total_amount).toLocaleString()} MMK` : ''}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
                      {statusLabel}
                    </span>
                    {p.screenshot_url && (
                      <button
                        onClick={() => setLightboxUrl(p.screenshot_url)}
                        className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none"
                        aria-label="View receipt">
                        <img src={p.screenshot_url} alt="receipt" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-base">Pay Monthly Fee</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {submitSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">Payment Submitted!</p>
                  <p className="text-sm text-gray-500">Your screenshot has been sent for review. We'll update your status shortly.</p>
                  <button onClick={closeModal} className="mt-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Amount */}
                  <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center justify-between">
                    <p className="text-sm text-teal-700 font-medium">Amount Due</p>
                    <p className="text-xl font-extrabold text-teal-700">
                      {Number(fee).toLocaleString()} <span className="text-sm font-medium">MMK</span>
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Payment Method</p>
                    {methodsLoading ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-teal-500">
                        <Spinner sm /> <span className="text-xs text-gray-400">Loading methods…</span>
                      </div>
                    ) : activeMethods.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">No active payment methods configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeMethods.map((m) => {
                          const isSelected = selectedMethodId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setSelectedMethodId(m.id); setSubmitError(''); }}
                              className={`w-full text-left border-2 rounded-xl px-4 py-3 transition ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-100 bg-gray-50 hover:border-teal-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-xs font-bold mb-0.5 ${
                                    isSelected ? 'text-teal-700' : 'text-gray-700'
                                  }`}>{m.method_name}</p>
                                  <p className="text-sm font-semibold text-gray-800">{m.account_number}</p>
                                  <p className="text-xs text-gray-500">{m.account_name}</p>
                                </div>
                                {isSelected && (
                                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Screenshot</p>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                    {previewUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={previewUrl} alt="Screenshot preview" className="w-full max-h-48 object-contain bg-gray-50" />
                        <button
                          onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:text-teal-500 transition"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Click to attach screenshot</span>
                        <span className="text-xs">PNG, JPG up to 5MB</span>
                      </button>
                    )}
                    {submitError && <p className="mt-2 text-xs text-red-500">{submitError}</p>}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={payMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                    >
                      {payMutation.isPending && <Spinner sm />}
                      Submit Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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

export default OwnerSubscription;
