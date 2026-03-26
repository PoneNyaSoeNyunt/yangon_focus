import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportService from '../../services/reportService';

const STATUS_STYLES = {
  Open:          'bg-amber-100 text-amber-700',
  Resolved:      'bg-green-100 text-green-700',
  'Action Taken':'bg-red-100 text-red-600',
};

const FILTER_TABS = ['All', 'Open', 'Resolved', 'Action Taken'];

const ResolveModal = ({ report, onClose, onSubmit, isPending }) => {
  const [status, setStatus]     = useState('Resolved');
  const [adminNote, setAdminNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Take Action</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Reporter</p>
            <p className="text-sm font-semibold text-gray-800">{report.reporter?.full_name} <span className="text-gray-400 font-normal">({report.reporter?.phone_number})</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Offender</p>
            <p className="text-sm font-semibold text-gray-800">{report.offender?.full_name} <span className="text-gray-400 font-normal">({report.offender?.phone_number})</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Resolution</label>
            <div className="flex gap-2">
              {['Resolved', 'Action Taken'].map((s) => (
                <button key={s} type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    status === s ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Note <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Note your action or reason…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              disabled={isPending}
              onClick={() => onSubmit(report.id, { status, admin_note: adminNote || null })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold transition">
              {isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected]   = useState(null);
  const [lightbox, setLightbox]   = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => reportService.getReports(),
  });

  const reports = data?.reports ?? [];

  const filtered = activeTab === 'All'
    ? reports
    : reports.filter((r) => r.status === activeTab);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? reports.length : reports.filter((r) => r.status === t).length;
    return acc;
  }, {});

  const resolveMutation = useMutation({
    mutationFn: ({ id, payload }) => reportService.resolveReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelected(null);
    },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Misconduct Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and act on filed complaints</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === t ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <span className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[report.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full self-start">{report.reason_category}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{new Date(report.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{new Date(report.created_at).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Reporter</p>
                  <p className="text-sm font-semibold text-gray-800">{report.reporter?.full_name}</p>
                  <p className="text-xs text-gray-400">{report.reporter?.phone_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{report.reporter?.role}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Offender</p>
                  <p className="text-sm font-semibold text-gray-800">{report.offender?.full_name}</p>
                  <p className="text-xs text-gray-400">{report.offender?.phone_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{report.offender?.role}</p>
                </div>
              </div>

              {report.description && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 mb-4 italic">
                  "{report.description}"
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setLightbox(report.evidence_url)}
                  className="flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Evidence
                </button>

                <div className="flex gap-2">
                  {report.admin_note && (
                    <span className="text-xs text-gray-500 italic max-w-xs truncate self-center">Note: {report.admin_note}</span>
                  )}
                  {report.status === 'Open' && (
                    <button
                      onClick={() => setSelected(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ResolveModal
          report={selected}
          onClose={() => setSelected(null)}
          isPending={resolveMutation.isPending}
          onSubmit={(id, payload) => resolveMutation.mutate({ id, payload })}
        />
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Evidence" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
