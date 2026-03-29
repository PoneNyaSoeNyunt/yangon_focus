import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportService from '../../services/reportService';

const STATUS_STYLES = {
  Open:          'bg-teal-100 text-teal-700',
  Investigating: 'bg-blue-100 text-blue-700',
  'Action Taken':'bg-red-100 text-red-700',
  Dismissed:     'bg-gray-100 text-gray-500',
};

const FILTER_TABS = ['All', 'Open', 'Investigating', 'Action Taken', 'Dismissed'];

const ACTIONS = [
  { label: 'Dismiss',       style: 'text-gray-600 hover:bg-gray-100 border-gray-200' },
  { label: 'Issue Warning', style: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
  { label: 'Suspend User',  style: 'text-red-600 hover:bg-red-50 border-red-200' },
];

const EvidenceModal = ({ report, onClose, onAction, isPending }) => {
  const [adminNote, setAdminNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Report Detail</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Filed {new Date(report.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Reporter</p>
              <p className="text-sm font-semibold text-gray-900">{report.reporter?.full_name}</p>
              <p className="text-xs text-gray-500 font-mono">{report.reporter?.phone_number}</p>
              <span className="mt-1 inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{report.reporter?.role}</span>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Offender</p>
              <p className="text-sm font-semibold text-gray-900">{report.offender?.full_name}</p>
              <p className="text-xs text-gray-500 font-mono">{report.offender?.phone_number}</p>
              <span className="mt-1 inline-block text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{report.offender?.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
              {report.category?.name ?? '—'}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[report.status_code?.label] ?? 'bg-gray-100 text-gray-500'}`}>
              {report.status_code?.label ?? '—'}
            </span>
          </div>

          {report.description && (
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed italic">"{report.description}"</p>
            </div>
          )}

          {report.evidence_url && (
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Evidence Screenshot</p>
              <img
                src={report.evidence_url}
                alt="Evidence"
                className="w-full rounded-xl border border-gray-200 object-contain max-h-64 bg-gray-50"
              />
            </div>
          )}

          {report.status_code?.label === 'Open' && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note for this action…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    disabled={isPending}
                    onClick={() => onAction(report.id, a.label, adminNote || null)}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border text-xs font-semibold disabled:opacity-50 transition ${a.style}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {report.admin_note && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
              <p className="text-xs uppercase font-semibold text-teal-600 mb-1">Admin Note</p>
              <p className="text-sm text-teal-800">{report.admin_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const queryClient = useQueryClient();
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

  const actionMutation = useMutation({
    mutationFn: ({ id, action, admin_note }) =>
      reportService.resolveReport(id, { action, admin_note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelected(null);
    },
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and act on misconduct reports</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
          <div className="overflow-x-auto">
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
        )}
      </div>

      {selected && (
        <EvidenceModal
          report={selected}
          onClose={() => setSelected(null)}
          isPending={actionMutation.isPending}
          onAction={(id, action, admin_note) => actionMutation.mutate({ id, action, admin_note })}
        />
      )}
    </div>
  );
};

export default AdminReports;
