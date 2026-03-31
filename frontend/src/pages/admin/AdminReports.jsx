import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import reportService from '../../services/reportService';
import DisputeModal from '../../components/admin/DisputeModal';

const STATUS_STYLES = {
  Open:          'bg-teal-100 text-teal-700',
  Investigating: 'bg-blue-100 text-blue-700',
  'Action Taken':'bg-red-100 text-red-700',
  Dismissed:     'bg-gray-100 text-gray-500',
};

const FILTER_TABS = ['All', 'Open', 'Investigating', 'Action Taken', 'Dismissed'];

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected]   = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn:  () => reportService.getReports(),
  });

  const reports = data?.reports ?? [];

  const filtered = activeTab === 'All'
    ? reports
    : reports.filter((r) => r.status_code?.label === activeTab);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? reports.length : reports.filter((r) => r.status_code?.label === t).length;
    return acc;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and act on misconduct reports</p>
      </div>

      {/* Mobile: combo box */}
      <div className="lg:hidden mb-6">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        >
          {FILTER_TABS.map((t) => (
            <option key={t} value={t}>
              {t}{counts[t] > 0 ? ` (${counts[t]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <div className="hidden lg:flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === t ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}>
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === t ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-200 lg:shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-400">Loading reports…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} reports found.
          </div>
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="lg:hidden p-3 space-y-3">
              {filtered.map((r, idx) => (
                <div key={r.id} className="p-4 space-y-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  {/* Header: index + status + category */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{idx + 1}</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full">
                        {r.category?.name ?? '—'}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[r.status_code?.label] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.status_code?.label ?? '—'}
                      </span>
                    </div>
                  </div>

                  {/* Reporter + Offender */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Reporter</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{r.reporter?.full_name}</p>
                      <p className="font-mono text-gray-400">{r.reporter?.phone_number}</p>
                      <span className="text-blue-600 font-semibold">{r.reporter?.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Offender</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{r.offender?.full_name}</p>
                      <p className="font-mono text-gray-400">{r.offender?.phone_number}</p>
                      <span className="text-purple-600 font-semibold">{r.offender?.role}</span>
                    </div>
                  </div>

                  {/* Date + View button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setSelected(r)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden lg:block rounded-b-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Offender</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 text-xs">{r.reporter?.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{r.reporter?.phone_number}</p>
                        <span className="text-[10px] text-blue-600 font-semibold">{r.reporter?.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 text-xs">{r.offender?.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{r.offender?.phone_number}</p>
                        <span className="text-[10px] text-purple-600 font-semibold">{r.offender?.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                          {r.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status_code?.label] ?? 'bg-gray-100 text-gray-500'}`}>
                          {r.status_code?.label ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelected(r)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selected && (
        <DisputeModal
          report={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default AdminReports;
