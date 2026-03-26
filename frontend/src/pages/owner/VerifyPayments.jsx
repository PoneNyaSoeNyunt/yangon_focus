import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentService from '../../services/paymentService';

const VerifyPayments = () => {
  const queryClient = useQueryClient();
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [lightbox, setLightbox]   = useState(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['owner-pending-payments'],
    queryFn: paymentService.getPendingDigitalPayments,
  });

  const verifyMutation = useMutation({
    mutationFn: (paymentId) => paymentService.verifyPayment(paymentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      setActionMsg(data.message ?? 'Payment verified. Booking confirmed.');
      setActionErr('');
    },
    onError: (err) => {
      setActionErr(err?.response?.data?.message ?? 'Verification failed.');
      setActionMsg('');
    },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Verify Digital Payments</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review uploaded screenshots and approve valid payments</p>
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No digital payments pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {payments.map((payment) => {
            const booking = payment.booking;
            const hostel  = booking?.bed?.room?.hostel;
            const total   = payment.type === 'Advance'
              ? Number(booking?.locked_price ?? 0)
              : Number(booking?.locked_price ?? 0) * Number(booking?.stay_duration ?? 1);

            return (
              <div key={payment.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 self-start">
                      Pending Review
                    </span>
                    <span className="text-xs text-gray-400">{payment.type}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  {payment.screenshot_url ? (
                    <button
                      type="button"
                      onClick={() => setLightbox(payment.screenshot_url)}
                      className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-teal-400 transition group"
                    >
                      <img
                        src={payment.screenshot_url}
                        alt="Payment screenshot"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </button>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Guest</p>
                      <p className="text-sm font-semibold text-gray-800">{booking?.guest?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{booking?.guest?.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Hostel / Bed</p>
                      <p className="text-sm text-gray-700">{hostel?.name} — Bed {booking?.bed?.bed_number}</p>
                    </div>
                    {payment.transaction_id && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Transaction ID</p>
                        <p className="text-sm font-mono text-teal-700">{payment.transaction_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Amount to confirm</p>
                    <p className="text-base font-bold text-teal-600">{total.toLocaleString()} MMK</p>
                  </div>
                  <button
                    disabled={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate(payment.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Screenshot"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyPayments;
