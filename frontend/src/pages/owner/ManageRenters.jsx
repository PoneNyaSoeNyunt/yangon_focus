import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ownerService from '../../services/ownerService';
import ReportModal from '../../components/shared/ReportModal';

const TYPE_COLORS = {
  KBZPay:   'bg-blue-50 text-blue-700 border-blue-100',
  WaveMoney:'bg-orange-50 text-orange-700 border-orange-100',
  Cash:     'bg-green-50 text-green-700 border-green-100',
  Advance:  'bg-purple-50 text-purple-700 border-purple-100',
};

const STATUS_COLORS = {
  Verified:       'text-green-600',
  'Pending Review': 'text-yellow-600',
};

function formatMMK(amount) {
  return `${Number(amount).toLocaleString()} MMK`;
}

function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '—';
  if (withTime) return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function PaymentHistoryModal({ renter, onClose }) {
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ['renter-payments', renter.guest_id],
    queryFn:  () => ownerService.getRenterPayments(renter.guest_id),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Payment History</h2>
            <p className="text-xs text-gray-500 mt-0.5">{renter.full_name} · Room {renter.room_label}, Bed {renter.bed_number}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>
          )}
          {isError && <p className="text-center text-sm text-red-500 py-8">Failed to load payments.</p>}
          {!isLoading && !isError && payments.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No payments recorded yet.</p>
          )}
          {!isLoading && !isError && payments.length > 0 && (
            <div className="space-y-3">
              {payments.map((p, idx) => (
                <div
                  key={p.payment_id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    p.is_advance ? 'border-purple-200 bg-purple-50/40' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5 flex flex-col items-center gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${TYPE_COLORS[p.payment_method] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {p.payment_method ?? 'Unknown'}
                    </span>
                    {p.is_advance && (
                      <span className="inline-block text-[10px] font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Paid Ahead
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{formatMMK(p.amount)}</p>
                      <span className={`text-xs font-medium ${STATUS_COLORS[p.status] ?? 'text-gray-500'}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.is_advance ? 'Advance' : `Payment #${idx + 1}`}
                      {p.payment_method ? ` • ${p.payment_method}` : ''}
                      {' • '}{formatDate(p.paid_at, true)}
                    </p>
                  </div>
                  {p.screenshot_url && (
                    <button
                      onClick={() => setLightboxUrl(p.screenshot_url)}
                      className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none"
                      aria-label="View receipt"
                    >
                      <img src={p.screenshot_url} alt="receipt" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
}

function TenantDrawer({ renter, onClose, onViewPayments }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Tenant Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-teal-700">{renter.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{renter.full_name}</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${
                renter.booking_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>{renter.booking_status}</span>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow label="Phone" value={renter.phone_number} icon="phone" />
            <InfoRow label="NRC Number" value={renter.formatted_nrc || 'N/A'} icon="id" />
            <InfoRow label="Room" value={`Room ${renter.room_label}`} icon="door" />
            <InfoRow label="Bed Number" value={`Bed ${renter.bed_number}`} icon="bed" />
            <InfoRow label="Check-in Date" value={formatDate(renter.check_in_date)} icon="calendar" />
            <InfoRow label="Months Committed" value={`${renter.stay_duration} months`} icon="clock" />
            <InfoRow label="Monthly Rate" value={formatMMK(renter.locked_price)} icon="money" />
          </div>

          <div className={`p-4 rounded-xl border ${
            isOverdue(renter.next_payment_due)
              ? 'bg-red-50 border-red-200'
              : isDueSoon(renter.next_payment_due)
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-teal-50 border-teal-200'
          }`}>
            <p className="text-xs font-medium text-gray-500 mb-1">Next Payment Due</p>
            <p className={`text-base font-bold ${
              isOverdue(renter.next_payment_due) ? 'text-red-600'
              : isDueSoon(renter.next_payment_due) ? 'text-yellow-700'
              : 'text-teal-700'
            }`}>
              {formatDate(renter.next_payment_due)}
            </p>
            {isOverdue(renter.next_payment_due) && (
              <p className="text-xs text-red-500 mt-1 font-medium">Overdue</p>
            )}
            {isDueSoon(renter.next_payment_due) && !isOverdue(renter.next_payment_due) && (
              <p className="text-xs text-yellow-600 mt-1 font-medium">Due within 7 days</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { onClose(); onViewPayments(renter); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Payment History
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  const icons = {
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    id:    'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
    door:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    bed:   'M4 7v10M20 7v10M4 12h16M4 7h16M4 17h16',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    money: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  };
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
        </svg>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-semibold mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function ManageRenters() {
  const [search, setSearch] = useState('');
  const [drawerRenter, setDrawerRenter]   = useState(null);
  const [historyRenter, setHistoryRenter] = useState(null);
  const [reportRenter, setReportRenter]   = useState(null);
  const [openDropdown, setOpenDropdown]   = useState(null);

  const { data: renters = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['owner-renters'],
    queryFn:  ownerService.getOwnerRenters.bind(ownerService),
  });

  const filtered = renters.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.room_label?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone_number?.includes(search)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Renters</h1>
        <p className="text-sm text-gray-500 mt-1">Active tenants across your hostels with payment tracking</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, room or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {filtered.length} tenant{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm font-medium">Failed to load renters.</p>
          <button onClick={refetch} className="mt-3 text-sm text-teal-600 hover:underline">Try again</button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-20">
          <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-400 font-medium text-sm">
            {search ? 'No renters match your search.' : 'No active tenants yet.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* ── Mobile cards (hidden on md+) ── */}
          <div className="md:hidden space-y-3">
            {filtered.map((renter, idx) => {
              const overdue = isOverdue(renter.next_payment_due);
              const soon    = isDueSoon(renter.next_payment_due);
              return (
                <div key={renter.booking_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-teal-700">{renter.full_name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          <span className="text-xs text-gray-400 font-mono mr-1">#{idx + 1}</span>
                          {renter.full_name}
                        </p>
                        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          renter.booking_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {renter.booking_status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{renter.phone_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-400 font-medium">Room / Bed</p>
                      <p className="font-semibold text-gray-700 mt-0.5">Room {renter.room_label}</p>
                      <p className="text-xs text-gray-500">Bed {renter.bed_number}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-2 ${overdue ? 'bg-red-50' : soon ? 'bg-yellow-50' : 'bg-teal-50'}`}>
                      <p className="text-xs text-gray-400 font-medium">Next Due</p>
                      <p className={`font-semibold mt-0.5 text-sm ${overdue ? 'text-red-600' : soon ? 'text-yellow-700' : 'text-teal-700'}`}>
                        {formatDate(renter.next_payment_due)}
                      </p>
                      {overdue && <p className="text-xs text-red-500 font-semibold">Overdue</p>}
                      {soon && !overdue && <p className="text-xs text-yellow-600 font-semibold">Due soon</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* View dropdown */}
                    <div className="relative flex-1">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === renter.booking_id ? null : renter.booking_id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                      >
                        View
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openDropdown === renter.booking_id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute left-0 bottom-full mb-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg py-1 min-w-[150px]">
                            <button
                              onClick={() => { setOpenDropdown(null); setDrawerRenter(renter); }}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                              Infos
                            </button>
                            <button
                              onClick={() => { setOpenDropdown(null); setHistoryRenter(renter); }}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                              Payment History
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Report */}
                    <button
                      onClick={() => setReportRenter(renter)}
                      className="flex-1 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                    >
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop table (hidden below md) ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room / Bed</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Due</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((renter, idx) => {
                  const overdue = isOverdue(renter.next_payment_due);
                  const soon    = isDueSoon(renter.next_payment_due);
                  return (
                    <tr key={renter.booking_id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-teal-700">{renter.full_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{renter.full_name}</p>
                            <p className="text-xs text-gray-400">{renter.phone_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">Room {renter.room_label}</p>
                        <p className="text-xs text-gray-400">Bed {renter.bed_number}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          renter.booking_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {renter.booking_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 ${overdue ? 'text-red-600' : soon ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {(overdue || soon) && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <span className="font-medium text-sm">{formatDate(renter.next_payment_due)}</span>
                        </div>
                        {overdue && <p className="text-xs text-red-500 font-semibold mt-0.5">Overdue</p>}
                        {soon && !overdue && <p className="text-xs text-yellow-600 font-semibold mt-0.5">Due soon</p>}
                      </td>
                      {/* DETAILS column: View dropdown */}
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === renter.booking_id ? null : renter.booking_id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          >
                            View
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openDropdown === renter.booking_id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg py-1 min-w-[140px]">
                                <button
                                  onClick={() => { setOpenDropdown(null); setDrawerRenter(renter); }}
                                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                  Infos
                                </button>
                                <button
                                  onClick={() => { setOpenDropdown(null); setHistoryRenter(renter); }}
                                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                  Payment History
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      {/* ACTIONS column: Report */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setReportRenter(renter)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {drawerRenter && (
        <TenantDrawer
          renter={drawerRenter}
          onClose={() => setDrawerRenter(null)}
          onViewPayments={(r) => setHistoryRenter(r)}
        />
      )}

      {historyRenter && (
        <PaymentHistoryModal
          renter={historyRenter}
          onClose={() => setHistoryRenter(null)}
        />
      )}

      {reportRenter && (
        <ReportModal
          offenderId={reportRenter.guest_id}
          offenderName={reportRenter.full_name}
          offenderRole="Guest"
          onClose={() => setReportRenter(null)}
          onSuccess={() => setReportRenter(null)}
        />
      )}
    </div>
  );
}
