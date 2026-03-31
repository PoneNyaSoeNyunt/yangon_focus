import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

const STATUS_STYLES = {
  'Active':               'bg-teal-100 text-teal-700',
  'Overdue':              'bg-red-100 text-red-700',
  'Pending Verification': 'bg-amber-100 text-amber-700',
  'No Subscription':      'bg-gray-100 text-gray-500',
};

const ACCOUNT_STATUS_STYLES = {
  'Active':      'bg-teal-100 text-teal-700',
  'Suspended':   'bg-amber-100 text-amber-700',
  'Blacklisted': 'bg-red-100 text-red-700',
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
  const [hostelModal, setHostelModal]   = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [subFilter, setSubFilter]             = useState('');

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openDropdown]);

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

  const manageMutation = useMutation({
    mutationFn: ({ id, label }) => apiClient.patch(`/admin/users/${id}/status`, { label }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] });
      setOpenDropdown(null);
    },
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

  const filteredOwners = owners.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.full_name?.toLowerCase().includes(q) ||
      o.phone_number?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || o.account_status === statusFilter;
    const matchSub    = !subFilter    || o.subscription_status === subFilter;
    return matchSearch && matchStatus && matchSub;
  });

  return (
    <div className="p-4 sm:p-6 w-full">
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
      <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm">
        <div className="px-4 py-4 lg:border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Owner Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredOwners.length} of {owners.length} owner{owners.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white transition"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
            {/* Subscription filter */}
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white transition"
            >
              <option value="">All Subscriptions</option>
              <option value="Active">Active</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="No Subscription">No Subscription</option>
            </select>
          </div>
        </div>

        {ownersLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-teal-500">
            <Spinner /> <span className="text-sm text-gray-400">Loading owners…</span>
          </div>
        ) : owners.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No owners registered yet.</div>
        ) : filteredOwners.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No owners match your search or filters.</div>
        ) : (
          <>
          {/* ── Mobile card list ── */}
          <div className="lg:hidden p-3 space-y-3">
            {filteredOwners.map((owner, idx) => (
              <div key={owner.id} className="p-4 space-y-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-gray-400 mr-1">#{idx + 1}</span>
                    <span className="font-bold text-gray-900 text-sm">{owner.full_name}</span>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACCOUNT_STATUS_STYLES[owner.account_status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {owner.account_status ?? 'Active'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">Subscription</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[owner.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {owner.subscription_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Phone</span>
                    <p className="font-mono text-gray-700 mt-0.5">{owner.phone_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">NRC</span>
                    <p className="text-gray-700 mt-0.5">{owner.nrc_number ?? '—'}</p>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-gray-400 font-medium">Hostels</span>
                    <div className="mt-0.5">
                      {owner.hostels && owner.hostels.length > 0
                        ? owner.hostels.map((h, i) => <p key={i} className="text-gray-700">{h}</p>)
                        : <p className="text-gray-400">No hostels</p>}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 flex-wrap pt-1" onClick={(e) => e.stopPropagation()}>
                  {/* View dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === `view-${owner.id}` ? null : `view-${owner.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      View
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === `view-${owner.id}` && (
                      <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button onClick={() => { setOpenDropdown(null); setHostelModal({ id: owner.id, name: owner.full_name }); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 transition">Hostels</button>
                        <button onClick={() => { setOpenDropdown(null); setPaymentModal({ id: owner.id, name: owner.full_name }); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 transition">Payments</button>
                      </div>
                    )}
                  </div>

                  {/* Verify */}
                  {owner.subscription_status === 'Pending Verification' && (
                    <button
                      onClick={() => verifyMutation.mutate(owner.id)}
                      disabled={verifyMutation.isPending && verifyMutation.variables === owner.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                    >
                      {verifyMutation.isPending && verifyMutation.variables === owner.id ? <Spinner sm /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      Verify
                    </button>
                  )}

                  {/* Manage dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === owner.id ? null : owner.id)}
                      disabled={manageMutation.isPending && manageMutation.variables?.id === owner.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {manageMutation.isPending && manageMutation.variables?.id === owner.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                      Manage
                    </button>
                    {openDropdown === owner.id && (
                      <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                        {owner.account_status !== 'Suspended' && (
                          <button onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Suspended' }); }}
                            disabled={manageMutation.isPending}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition">Suspend</button>
                        )}
                        {owner.account_status !== 'Blacklisted' && (
                          <button onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Blacklisted' }); }}
                            disabled={manageMutation.isPending}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 transition">Blacklist</button>
                        )}
                        {owner.account_status !== 'Active' && (
                          <button onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Active' }); }}
                            disabled={manageMutation.isPending}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition">Activate</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden lg:block overflow-x-auto overflow-hidden rounded-b-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-8">#</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Full Name</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Phone Number</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">NRC Number</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Hostel</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Subscription</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Details</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOwners.map((owner, idx) => (
                  <tr key={owner.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-3 py-4 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-3 py-4 font-semibold text-gray-900 whitespace-nowrap">{owner.full_name}</td>
                    <td className="px-3 py-4 font-mono text-gray-600 whitespace-nowrap">{owner.phone_number}</td>
                    <td className="px-3 py-4 text-gray-600 whitespace-nowrap">{owner.nrc_number ?? '—'}</td>
                    <td className="px-3 py-4">
                      {owner.hostels && owner.hostels.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {owner.hostels.map((hostelName, i) => (
                            <span key={i} className="text-xs text-gray-700">{hostelName}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No hostels</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACCOUNT_STATUS_STYLES[owner.account_status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {owner.account_status ?? 'Active'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[owner.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {owner.subscription_status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === `view-${owner.id}` ? null : `view-${owner.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          View
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openDropdown === `view-${owner.id}` && (
                          <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                            <button
                              onClick={() => { setOpenDropdown(null); setHostelModal({ id: owner.id, name: owner.full_name }); }}
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 transition"
                            >
                              Hostels
                            </button>
                            <button
                              onClick={() => { setOpenDropdown(null); setPaymentModal({ id: owner.id, name: owner.full_name }); }}
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-teal-50 transition"
                            >
                              Payments
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
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

                        {/* Manage dropdown */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenDropdown(openDropdown === owner.id ? null : owner.id)}
                            disabled={manageMutation.isPending && manageMutation.variables?.id === owner.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {manageMutation.isPending && manageMutation.variables?.id === owner.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                            Manage
                          </button>
                          {openDropdown === owner.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                              {owner.account_status !== 'Suspended' && (
                                <button
                                  onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Suspended' }); }}
                                  disabled={manageMutation.isPending}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
                                >
                                  Suspend
                                </button>
                              )}
                              {owner.account_status !== 'Blacklisted' && (
                                <button
                                  onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Blacklisted' }); }}
                                  disabled={manageMutation.isPending}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 transition"
                                >
                                  Blacklist
                                </button>
                              )}
                              {owner.account_status !== 'Active' && (
                                <button
                                  onClick={() => { setOpenDropdown(null); manageMutation.mutate({ id: owner.id, label: 'Active' }); }}
                                  disabled={manageMutation.isPending}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition"
                                >
                                  Activate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
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
