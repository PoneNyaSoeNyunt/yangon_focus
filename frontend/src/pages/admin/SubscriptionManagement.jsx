import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

const STATUS_STYLES = {
  'Active':               'bg-teal-100 text-teal-700',
  'Overdue':              'bg-red-100 text-red-700',
  'Pending Verification': 'bg-amber-100 text-amber-700',
  'No Subscription':      'bg-gray-100 text-gray-500',
};

const PAYMENT_STATUS_STYLES = {
  'Verified':     'bg-green-100 text-green-700',
  'Rejected':     'bg-red-100 text-red-700',
  'Pending Review': 'bg-amber-100 text-amber-700',
};

const Spinner = ({ sm }) => (
  <svg className={`${sm ? 'w-3.5 h-3.5' : 'w-5 h-5'} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[85vh] flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">{children}</div>
    </div>
  </div>
);

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtAmt = (v) =>
  v != null ? Number(v).toLocaleString() + ' MMK' : '—';

const SubscriptionManagement = () => {
  const queryClient = useQueryClient();

  const [feeModal, setFeeModal]       = useState(false);
  const [feeInput, setFeeInput]       = useState('');
  const [feeError, setFeeError]       = useState('');
  const [hostelModal, setHostelModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);

  const { data: configData } = useQuery({
    queryKey: ['admin-sub-config'],
    queryFn:  () => apiClient.get('/admin/subscription-config').then((r) => r.data),
  });

  const { data: ownersData, isLoading: ownersLoading } = useQuery({
    queryKey: ['admin-owners'],
    queryFn:  () => apiClient.get('/admin/owners').then((r) => r.data),
  });

  const { data: hostelsData, isLoading: hostelsLoading } = useQuery({
    queryKey: ['admin-owner-hostels', hostelModal?.id],
    queryFn:  () => apiClient.get(`/admin/owners/${hostelModal.id}/hostels`).then((r) => r.data),
    enabled:  !!hostelModal,
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-owner-sub-history', paymentModal?.id],
    queryFn:  () => apiClient.get(`/admin/owners/${paymentModal.id}/subscription-history`).then((r) => r.data),
    enabled:  !!paymentModal,
  });

  const verifyMutation = useMutation({
    mutationFn: (ownerId) => apiClient.patch(`/admin/owners/${ownerId}/subscription/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-owners'] }),
  });

  const updateFeeMutation = useMutation({
    mutationFn: (value) => apiClient.patch('/admin/subscription-config', { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sub-config'] });
      setFeeModal(false);
      setFeeInput('');
      setFeeError('');
    },
    onError: (err) => {
      setFeeError(err?.response?.data?.message ?? 'Update failed. Please try again.');
    },
  });

  const openFeeModal = () => {
    setFeeInput(configData?.value ?? '');
    setFeeError('');
    setFeeModal(true);
  };

  const handleFeeUpdate = () => {
    if (!feeInput || isNaN(Number(feeInput)) || Number(feeInput) < 0) {
      setFeeError('Please enter a valid positive number.');
      return;
    }
    updateFeeMutation.mutate(feeInput);
  };

  const owners  = Array.isArray(ownersData)   ? ownersData   : [];
  const hostels = Array.isArray(hostelsData)  ? hostelsData  : [];
  const payments = Array.isArray(paymentsData) ? paymentsData : [];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Subscription Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage owner subscriptions and platform fee settings</p>
      </div>

      {/* Fee Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1">Current Monthly Subscription Fee</p>
          <p className="text-3xl font-extrabold text-teal-600 leading-tight">
            {configData?.value != null ? Number(configData.value).toLocaleString() : '—'}
            <span className="text-sm font-medium text-gray-400 ml-1.5">MMK / month</span>
          </p>
        </div>
        <button
          onClick={openFeeModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Update Fee
        </button>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Owner Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {owners.length} registered owner{owners.length !== 1 ? 's' : ''}
          </p>
        </div>

        {ownersLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-teal-500">
            <Spinner /> <span className="text-sm text-gray-400">Loading owners…</span>
          </div>
        ) : owners.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No owners registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 w-10">#</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">Full Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">Phone Number</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">NRC Number</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">Subscription</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {owners.map((owner, idx) => (
                  <tr key={owner.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{owner.full_name}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{owner.phone_number}</td>
                    <td className="px-6 py-4 text-gray-600">{owner.nrc_number ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[owner.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {owner.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {owner.subscription_status === 'Pending Verification' && (
                          <button
                            onClick={() => verifyMutation.mutate(owner.id)}
                            disabled={verifyMutation.isPending && verifyMutation.variables === owner.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                          >
                            {verifyMutation.isPending && verifyMutation.variables === owner.id
                              ? <Spinner sm />
                              : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            }
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => setHostelModal({ id: owner.id, name: owner.full_name })}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Hostels
                        </button>
                        <button
                          onClick={() => setPaymentModal({ id: owner.id, name: owner.full_name })}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                        >
                          Payments
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Fee Update Modal --- */}
      {feeModal && (
        <Modal title="Update Monthly Subscription Fee" onClose={() => setFeeModal(false)}>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Current fee: <span className="font-semibold text-teal-600">{configData?.value != null ? Number(configData.value).toLocaleString() : '—'} MMK</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Fee (MMK)</label>
              <input
                type="number"
                min="0"
                value={feeInput}
                onChange={(e) => { setFeeInput(e.target.value); setFeeError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 hover:border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                placeholder="e.g. 5000"
              />
              {feeError && <p className="mt-1.5 text-xs text-red-500">{feeError}</p>}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setFeeModal(false); setFeeError(''); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFeeUpdate}
                disabled={updateFeeMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
              >
                {updateFeeMutation.isPending && <Spinner sm />}
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Hostel Detail Modal --- */}
      {hostelModal && (
        <Modal title={`${hostelModal.name} — Hostels`} onClose={() => setHostelModal(null)} wide>
          {hostelsLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-teal-500">
              <Spinner /> <span className="text-sm text-gray-400">Loading hostels…</span>
            </div>
          ) : hostels.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hostels found for this owner.</p>
          ) : (
            <div className="space-y-5">
              {hostels.map((hostel) => (
                <div key={hostel.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-teal-50 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-teal-800 text-sm">{hostel.name}</p>
                      <p className="text-xs text-teal-600 mt-0.5">
                        {hostel.township?.name ?? '—'}
                        {hostel.listing_status?.label && (
                          <span className="ml-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-semibold">
                            {hostel.listing_status.label}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-teal-600 font-semibold flex-shrink-0">
                      {hostel.rooms?.length ?? 0} room{(hostel.rooms?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {hostel.rooms?.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-2.5 font-semibold text-gray-500">Room Label</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500">Max Occupancy</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-right">Price / Month</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {hostel.rooms.map((room) => (
                          <tr key={room.id} className="hover:bg-gray-50/60 transition">
                            <td className="px-4 py-3 font-medium text-gray-800">{room.label}</td>
                            <td className="px-4 py-3 text-gray-500">{room.max_occupancy} beds</td>
                            <td className="px-4 py-3 text-right font-semibold text-teal-700">
                              {Number(room.price_per_month).toLocaleString()} MMK
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-gray-400 px-4 py-3">No rooms defined for this hostel.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* --- Payment History Modal --- */}
      {paymentModal && (
        <Modal title={`${paymentModal.name} — Subscription Payments`} onClose={() => setPaymentModal(null)} wide>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-teal-500">
              <Spinner /> <span className="text-sm text-gray-400">Loading payments…</span>
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No subscription payments found for this owner.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Method</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">{fmtAmt(p.total_amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{p.payment_method ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{fmtDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLES[p.status?.label] ?? 'bg-gray-100 text-gray-500'}`}>
                          {p.status?.label ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default SubscriptionManagement;
