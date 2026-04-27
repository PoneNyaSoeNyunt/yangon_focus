import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';

const STATUS_STYLES = {
  'Pending Review': 'bg-teal-100 text-teal-700',
  'Verified':       'bg-green-100 text-green-700',
  'Rejected':       'bg-red-100 text-red-700',
  'Disabled':       'bg-amber-100 text-amber-700',
};

const LicenseCard = ({ license, onView }) => {
  const isHostelDisabled = license.hostel?.listing_status?.label === 'Disabled';
  const statusLabel = isHostelDisabled ? 'Disabled' : (license.status?.label ?? 'Unknown');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div
        className="relative h-40 bg-gray-100 cursor-pointer group"
        onClick={() => onView(license)}
      >
        {license.image_url ? (
          <img
            src={license.image_url}
            alt="License"
            className="w-full h-full object-cover group-hover:opacity-90 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
          <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            Quick View
          </span>
        </div>
        <span className={`absolute top-2 right-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Hostel</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{license.hostel?.name ?? '—'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Owner</p>
            <p className="text-sm text-gray-700 truncate">{license.hostel?.owner?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Submitted</p>
            <p className="text-sm text-gray-700">
              {license.submitted_at
                ? new Date(license.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">License No.</p>
          <p className="text-sm font-mono text-gray-700">{license.license_number}</p>
        </div>

        {license.rejection_reason && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <p className="text-xs text-red-500 font-medium">Rejection reason:</p>
            <p className="text-xs text-red-700 mt-0.5">{license.rejection_reason}</p>
          </div>
        )}

        <div className="mt-auto pt-1">
          <button
            onClick={() => onView(license)}
            className="w-full text-center text-xs font-semibold text-teal-600 hover:text-teal-700 py-1.5 rounded-lg hover:bg-teal-50 transition"
          >
            View & Take Action
          </button>
        </div>
      </div>
    </div>
  );
};

const RejectModal = ({ onConfirm, onCancel, isPending }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Reject License</h3>
        <p className="text-sm text-gray-500 mb-4">Provide an optional reason for rejection.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection (optional)..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
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

const DisableModal = ({ onConfirm, onCancel, isPending }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Disable Hostel</h3>
        <p className="text-sm text-gray-500 mb-4">Provide a reason for disabling this hostel. The owner will see this message.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for disabling (required)..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60"
          >
            {isPending ? 'Disabling...' : 'Confirm Disable'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LicenseModal = ({ license, onClose, onApprove, onReject, onDisable, onUndoDisable, isPending, isDisabling, isUndoing }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const isHostelDisabled = license.hostel?.listing_status?.label === 'Disabled';
  const statusLabel = isHostelDisabled ? 'Disabled' : (license.status?.label ?? 'Unknown');
  const isPendingReview = statusLabel === 'Pending Review';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">License Verification</h2>
            <p className="text-xs text-gray-400 mt-0.5">{license.hostel?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ minHeight: '220px' }}>
              {license.image_url ? (
                <img
                  src={license.image_url}
                  alt="Business License"
                  className="w-full max-h-72 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 py-12">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">License Number</p>
                <p className="text-sm font-mono font-semibold text-gray-900 mt-0.5">{license.license_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hostel</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{license.hostel?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hostel Type</p>
                <p className="text-sm text-gray-700 mt-0.5">{license.hostel?.type ?? '—'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Owner</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{license.hostel?.owner?.full_name ?? '—'}</p>
                <p className="text-xs text-gray-400 font-mono">{license.hostel?.owner?.phone_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Submitted</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {license.submitted_at
                    ? new Date(license.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Status</p>
                <span className={`inline-flex mt-0.5 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {license.rejection_reason && (
              <div className="sm:col-span-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Rejection Reason</p>
                <p className="text-sm text-red-700 mt-1">{license.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {isPendingReview && (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isPending || isDisabling}
                className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={isPending || isDisabling}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve
              </button>
            </>
          )}
          {statusLabel === 'Disabled' && (
            <button
              onClick={onUndoDisable}
              disabled={isUndoing}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isUndoing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              )}
              Undo Disable
            </button>
          )}
          {!isPendingReview && statusLabel !== 'Disabled' && (
            <button
              onClick={() => setShowDisableForm(true)}
              disabled={isDisabling}
              className="flex-1 py-2.5 rounded-xl border border-amber-400 text-amber-600 text-sm font-semibold hover:bg-amber-50 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isDisabling ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
              Disable
            </button>
          )}
        </div>
      </div>

      {showRejectForm && (
        <RejectModal
          onConfirm={(reason) => { setShowRejectForm(false); onReject(reason); }}
          onCancel={() => setShowRejectForm(false)}
          isPending={isPending}
        />
      )}
      {showDisableForm && (
        <DisableModal
          onConfirm={(reason) => { setShowDisableForm(false); onDisable(reason); }}
          onCancel={() => setShowDisableForm(false)}
          isPending={isDisabling}
        />
      )}
    </div>
  );
};

const LicenseVerification = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Pending Review');
  const [selectedLicense, setSelectedLicense] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-licenses', page, statusFilter],
    queryFn: () => adminService.getLicenses(page, statusFilter ? { status_label: statusFilter } : {}),
    keepPreviousData: true,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, label, reason }) => adminService.verifyLicense(id, label, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
      setSelectedLicense(null);
    },
  });

  const disableMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.disableLicense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
      setSelectedLicense(null);
    },
  });

  const undoMutation = useMutation({
    mutationFn: (id) => adminService.undoDisableLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
      setSelectedLicense(null);
    },
  });

  const licenses = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Licenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and verify hostel business license submissions</p>
        </div>
        {!isLoading && (
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{total} Licenses</span>
          </div>
        )}
      </div>

      {/* Mobile: combo box */}
      <div className="lg:hidden mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        >
          <option value="">All</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
          <option value="Disabled">Disabled</option>
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <div className="hidden lg:flex gap-2 mb-6">
        {['', 'Pending Review', 'Verified', 'Rejected', 'Disabled'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s}
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
      ) : isError ? (
        <div className="text-center py-24 text-red-400 text-sm font-medium">
          Failed to load licenses.
        </div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-24">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No licenses found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {licenses.map((license) => (
              <LicenseCard
                key={license.id}
                license={license}
                onView={setSelectedLicense}
              />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-700">{page}</span> of{' '}
                <span className="font-medium text-gray-700">{lastPage}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedLicense && (
        <LicenseModal
          license={selectedLicense}
          onClose={() => setSelectedLicense(null)}
          onApprove={() => verifyMutation.mutate({ id: selectedLicense.id, label: 'Verified', reason: null })}
          onReject={(reason) => verifyMutation.mutate({ id: selectedLicense.id, label: 'Rejected', reason })}
          onDisable={(reason) => disableMutation.mutate({ id: selectedLicense.id, reason })}
          onUndoDisable={() => undoMutation.mutate(selectedLicense.id)}
          isPending={verifyMutation.isPending}
          isDisabling={disableMutation.isPending}
          isUndoing={undoMutation.isPending}
        />
      )}
    </div>
  );
};

export default LicenseVerification;
