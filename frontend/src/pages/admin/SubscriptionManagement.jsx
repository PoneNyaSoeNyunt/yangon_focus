import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import adminService from '../../services/adminService';

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
const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtAmt = (v) =>
  v != null ? Number(v).toLocaleString() + ' MMK' : '—';

const SubscriptionManagement = () => {
  const queryClient = useQueryClient();

  const [feeModal, setFeeModal]       = useState(false);
  const [feeInput, setFeeInput]       = useState('');
  const [feeError, setFeeError]       = useState('');
  const [detailsModal, setDetailsModal] = useState(null);
  const [search, setSearch]                   = useState('');
  const [subFilter, setSubFilter]             = useState('');

  const [walletModal, setWalletModal]   = useState(null);
  const [walletForm, setWalletForm]     = useState({ method_name: '', account_number: '', account_name: '' });
  const [walletError, setWalletError]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [lightboxUrl, setLightboxUrl]     = useState(null);
  const [disableTarget, setDisableTarget] = useState(null);
  const [disableReason, setDisableReason] = useState('');

  const hostelDisableMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.disableLicense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hostels-subscription'] });
      setDisableTarget(null);
      setDisableReason('');
    },
  });

  const hostelUndoDisableMutation = useMutation({
    mutationFn: (id) => adminService.undoDisableLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hostels-subscription'] });
    },
  });

  const { data: configData } = useQuery({
    queryKey: ['admin-sub-config'],
    queryFn:  () => apiClient.get('/admin/subscription-config').then((r) => r.data),
  });

  const { data: walletsData, isLoading: walletsLoading } = useQuery({
    queryKey: ['admin-platform-wallets'],
    queryFn:  () => apiClient.get('/admin/payment-methods').then((r) => r.data),
  });

  const { data: hostelRowsData, isLoading: hostelsLoading } = useQuery({
    queryKey: ['admin-hostels-subscription'],
    queryFn:  () => apiClient.get('/admin/hostels-subscription').then((r) => r.data),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-owner-sub-history', detailsModal?.owner_id],
    queryFn:  () => apiClient.get(`/admin/owners/${detailsModal.owner_id}/subscription-history`).then((r) => r.data),
    enabled:  !!detailsModal?.owner_id,
  });

  const verifyMutation = useMutation({
    mutationFn: (ownerId) => apiClient.patch(`/admin/owners/${ownerId}/subscription/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-hostels-subscription'] }),
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

  const createWalletMutation = useMutation({
    mutationFn: (data) => apiClient.post('/admin/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-wallets'] });
      setWalletModal(null);
      setWalletForm({ method_name: '', account_number: '', account_name: '' });
      setWalletError('');
    },
    onError: (err) => setWalletError(err?.response?.data?.message ?? 'Failed to add wallet.'),
  });

  const updateWalletMutation = useMutation({
    mutationFn: ({ id, ...data }) => apiClient.patch(`/admin/payment-methods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-wallets'] });
      setWalletModal(null);
      setWalletForm({ method_name: '', account_number: '', account_name: '' });
      setWalletError('');
    },
    onError: (err) => setWalletError(err?.response?.data?.message ?? 'Failed to update wallet.'),
  });

  const toggleWalletMutation = useMutation({
    mutationFn: ({ id, is_active }) => apiClient.patch(`/admin/payment-methods/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-platform-wallets'] }),
  });

  const deleteWalletMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/admin/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-wallets'] });
      setDeleteConfirm(null);
    },
  });

  const openFeeModal = () => {
    setFeeInput(configData?.value ?? '');
    setFeeError('');
    setFeeModal(true);
  };

  const openAddWallet = () => {
    setWalletForm({ method_name: '', account_number: '', account_name: '' });
    setWalletError('');
    setWalletModal('add');
  };

  const openEditWallet = (w) => {
    setWalletForm({ method_name: w.method_name, account_number: w.account_number, account_name: w.account_name });
    setWalletError('');
    setWalletModal(w);
  };

  const handleWalletSubmit = () => {
    if (!walletForm.method_name.trim()) { setWalletError('Method name is required.'); return; }
    if (!walletForm.account_number.trim()) { setWalletError('Account number is required.'); return; }
    if (!walletForm.account_name.trim()) { setWalletError('Account name is required.'); return; }
    if (walletModal === 'add') {
      createWalletMutation.mutate(walletForm);
    } else {
      updateWalletMutation.mutate({ id: walletModal.id, ...walletForm });
    }
  };

  const handleFeeUpdate = () => {
    if (!feeInput || isNaN(Number(feeInput)) || Number(feeInput) < 0) {
      setFeeError('Please enter a valid positive number.');
      return;
    }
    updateFeeMutation.mutate(feeInput);
  };

  const hostelRows = Array.isArray(hostelRowsData) ? hostelRowsData : [];
  const payments   = Array.isArray(paymentsData)   ? paymentsData   : [];
  const wallets    = Array.isArray(walletsData)    ? walletsData    : [];

  const filteredRows = hostelRows.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      h.hostel_name?.toLowerCase().includes(q) ||
      h.owner_name?.toLowerCase().includes(q) ||
      h.owner_phone?.toLowerCase().includes(q);
    const matchSub = !subFilter || h.subscription_status === subFilter;
    return matchSearch && matchSub;
  });

  return (
    <div className="p-4 sm:p-6 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
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

      {/* Platform Wallet Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Platform Wallet Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Payment accounts shown to owners when paying subscription</p>
          </div>
          <button
            onClick={openAddWallet}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Wallet
          </button>
        </div>

        {walletsLoading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-teal-500">
            <Spinner sm /> <span className="text-xs text-gray-400">Loading wallets…</span>
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No platform wallets configured yet.</p>
        ) : (
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{w.method_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        w.is_active ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {w.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{w.account_number} · {w.account_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleWalletMutation.mutate({ id: w.id, is_active: !w.is_active })}
                    disabled={toggleWalletMutation.isPending}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      w.is_active
                        ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100'
                    } disabled:opacity-50`}
                  >
                    {w.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditWallet(w)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(w)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hostel Lists Table */}
      <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm">
        <div className="px-4 py-4 lg:border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Hostel Lists</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredRows.length} of {hostelRows.length} hostel{hostelRows.length !== 1 ? 's' : ''}
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
                placeholder="Search by hostel, owner or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
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

        {hostelsLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-teal-500">
            <Spinner /> <span className="text-sm text-gray-400">Loading hostels…</span>
          </div>
        ) : hostelRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hostels listed yet.</div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hostels match your search or filters.</div>
        ) : (
          <>
          {/* ── Mobile card list ── */}
          <div className="lg:hidden p-3 space-y-3">
            {filteredRows.map((row, idx) => {
              const ownerHasSubscription = row.subscription_status !== 'No Subscription';
              const isDisabled = row.listing_status === 'Disabled';
              const canDisable = ownerHasSubscription && row.business_license_id && !isDisabled;
              const canVerify  = row.subscription_status === 'Pending Verification';
              return (
                <div key={row.id} className="p-4 space-y-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-gray-400 mr-1">#{idx + 1}</span>
                      <span className={`font-bold text-sm ${row.hostel_name ? 'text-gray-900' : 'text-gray-400 italic'}`}>{row.hostel_name ?? 'No hostels yet'}</span>
                      {row.listing_status && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.listing_status === 'Published' ? 'bg-teal-100 text-teal-700'
                          : row.listing_status === 'Disabled' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                          {row.listing_status}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[row.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {row.subscription_status}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium">Owner</span>
                      <p className="text-gray-700 mt-0.5">{row.owner_name ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Next Payment Due</span>
                      <p className="text-gray-700 mt-0.5">{row.next_payment_due ? fmtDate(row.next_payment_due) : '—'}</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => setDetailsModal(row)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Show
                    </button>

                    {canVerify && (
                      <button
                        onClick={() => verifyMutation.mutate(row.owner_id)}
                        disabled={verifyMutation.isPending && verifyMutation.variables === row.owner_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                      >
                        {verifyMutation.isPending && verifyMutation.variables === row.owner_id
                          ? <Spinner sm />
                          : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        }
                        Verify
                      </button>
                    )}

                    {canDisable && (
                      <button
                        onClick={() => setDisableTarget({ hostelName: row.hostel_name, licenseId: row.business_license_id })}
                        className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-600 text-xs font-semibold hover:bg-amber-50 transition"
                      >
                        Disable
                      </button>
                    )}

                    {ownerHasSubscription && isDisabled && row.business_license_id && (
                      <button
                        onClick={() => hostelUndoDisableMutation.mutate(row.business_license_id)}
                        disabled={hostelUndoDisableMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition disabled:opacity-60"
                      >
                        {hostelUndoDisableMutation.isPending ? 'Undoing…' : 'Undo Disable'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden lg:block rounded-b-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-8">#</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Hostel Name</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Owner Name</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Subscription Status</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Next Payment Due</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Details</th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((row, idx) => {
                  const ownerHasSubscription = row.subscription_status !== 'No Subscription';
                  const isDisabled = row.listing_status === 'Disabled';
                  const canDisable = ownerHasSubscription && row.business_license_id && !isDisabled;
                  const canVerify  = row.subscription_status === 'Pending Verification';
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-3 py-4 text-gray-400 text-xs">{idx + 1}</td>
                      <td className={`px-3 py-4 font-semibold whitespace-nowrap ${row.hostel_name ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {row.hostel_name ?? 'No hostels yet'}
                        {row.listing_status && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.listing_status === 'Published' ? 'bg-teal-100 text-teal-700'
                            : row.listing_status === 'Disabled' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                            {row.listing_status}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{row.owner_name ?? '—'}</td>
                      <td className="px-3 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[row.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {row.subscription_status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                        {row.next_payment_due ? fmtDate(row.next_payment_due) : '—'}
                      </td>
                      <td className="px-3 py-4">
                        <button
                          onClick={() => setDetailsModal(row)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Show
                        </button>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {canVerify && (
                            <button
                              onClick={() => verifyMutation.mutate(row.owner_id)}
                              disabled={verifyMutation.isPending && verifyMutation.variables === row.owner_id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                            >
                              {verifyMutation.isPending && verifyMutation.variables === row.owner_id
                                ? <Spinner sm />
                                : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              }
                              Verify
                            </button>
                          )}

                          {canDisable && (
                            <button
                              onClick={() => setDisableTarget({ hostelName: row.hostel_name, licenseId: row.business_license_id })}
                              className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-600 text-xs font-semibold hover:bg-amber-50 transition"
                            >
                              Disable
                            </button>
                          )}

                          {ownerHasSubscription && isDisabled && row.business_license_id && (
                            <button
                              onClick={() => hostelUndoDisableMutation.mutate(row.business_license_id)}
                              disabled={hostelUndoDisableMutation.isPending}
                              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition disabled:opacity-60"
                            >
                              {hostelUndoDisableMutation.isPending ? 'Undoing…' : 'Undo Disable'}
                            </button>
                          )}

                          {!canVerify && !canDisable && !(ownerHasSubscription && isDisabled) && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* --- Details Modal (Owner info + Payment history) --- */}
      {detailsModal && (
        <Modal title={`${detailsModal.hostel_name ?? detailsModal.owner_name} — Details`} onClose={() => setDetailsModal(null)} wide>
          <div className="space-y-6">
            {/* Owner Info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Owner Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">Full Name</p>
                  <p className="text-sm text-gray-800 font-semibold">{detailsModal.owner_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">Phone</p>
                  <p className="text-sm text-gray-800 font-mono">{detailsModal.owner_phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">NRC</p>
                  <p className="text-sm text-gray-800">{detailsModal.owner_nrc ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">Account Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ACCOUNT_STATUS_STYLES[detailsModal.owner_account_status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {detailsModal.owner_account_status ?? 'Active'}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">Subscription</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[detailsModal.subscription_status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {detailsModal.subscription_status}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">Next Payment Due</p>
                  <p className="text-sm text-gray-800">{detailsModal.next_payment_due ? fmtDate(detailsModal.next_payment_due) : '—'}</p>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Subscription Payment History</h4>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8 gap-3 text-teal-500">
                  <Spinner sm /> <span className="text-xs text-gray-400">Loading payments…</span>
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No subscription payments yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {payments.map((p, idx) => {
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
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${methodCls}`}>
                            {p.payment_method ?? 'Unknown'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">Payment #{payments.length - idx}</p>
                          <p className="text-gray-400 mt-0.5 truncate">
                            {fmtDateTime(p.created_at)}
                            {p.total_amount ? ` · ${fmtAmt(p.total_amount)}` : ''}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* --- Hostel Disable Reason Modal --- */}
      {disableTarget && (
        <Modal title={`Disable — ${disableTarget.hostelName}`} onClose={() => { setDisableTarget(null); setDisableReason(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Provide a reason for disabling this hostel. The owner will see this message.</p>
            <textarea
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              rows={3}
              placeholder="Reason for disabling (required)..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setDisableTarget(null); setDisableReason(''); }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => hostelDisableMutation.mutate({ id: disableTarget.licenseId, reason: disableReason })}
                disabled={hostelDisableMutation.isPending || !disableReason.trim()}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {hostelDisableMutation.isPending ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Wallet Add/Edit Modal --- */}
      {walletModal && (
        <Modal
          title={walletModal === 'add' ? 'Add Platform Wallet' : `Edit — ${walletModal.method_name}`}
          onClose={() => { setWalletModal(null); setWalletError(''); }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Method Name *</label>
              <input
                type="text"
                placeholder="e.g. KBZPay, WaveMoney, AYA Pay"
                value={walletForm.method_name}
                onChange={(e) => setWalletForm((f) => ({ ...f, method_name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Number *</label>
              <input
                type="text"
                placeholder="e.g. 09123456789"
                value={walletForm.account_number}
                onChange={(e) => setWalletForm((f) => ({ ...f, account_number: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Name *</label>
              <input
                type="text"
                placeholder="e.g. Yangon Focus"
                value={walletForm.account_name}
                onChange={(e) => setWalletForm((f) => ({ ...f, account_name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            {walletError && <p className="text-xs text-red-500">{walletError}</p>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleWalletSubmit}
                disabled={createWalletMutation.isPending || updateWalletMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
              >
                {(createWalletMutation.isPending || updateWalletMutation.isPending) && <Spinner sm />}
                {walletModal === 'add' ? 'Add Wallet' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setWalletModal(null); setWalletError(''); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Delete Confirm Modal --- */}
      {deleteConfirm && (
        <Modal title="Remove Wallet" onClose={() => setDeleteConfirm(null)}>
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Delete <span className="text-red-500">{deleteConfirm.method_name}</span>?</p>
              <p className="text-sm text-gray-400">This wallet will be permanently removed and can no longer be used for subscription payments.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => deleteWalletMutation.mutate(deleteConfirm.id)}
                disabled={deleteWalletMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
              >
                {deleteWalletMutation.isPending && <Spinner sm />}
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
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

export default SubscriptionManagement;
