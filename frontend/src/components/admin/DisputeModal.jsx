import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import reportService from '../../services/reportService';

const STATUS_ID = { OPEN: 14, INVESTIGATING: 15, ACTION_TAKEN: 16, DISMISSED: 17 };

const STATUS_STYLES = {
  Open:          'bg-teal-100 text-teal-700',
  Investigating: 'bg-blue-100 text-blue-700',
  'Action Taken':'bg-red-100 text-red-700',
  Dismissed:     'bg-gray-100 text-gray-500',
};

const BUTTONS_BY_STATUS = {
  [STATUS_ID.OPEN]: [
    { label: 'Investigating', toId: STATUS_ID.INVESTIGATING, style: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
    { label: 'Dismiss',       toId: STATUS_ID.DISMISSED,     style: 'text-gray-600 hover:bg-gray-100 border-gray-200' },
  ],
  [STATUS_ID.INVESTIGATING]: [
    { label: 'Re-open',       toId: STATUS_ID.OPEN,          style: 'text-teal-600 hover:bg-teal-50 border-teal-200' },
    { label: 'Action Taken',  toId: STATUS_ID.ACTION_TAKEN,  style: 'text-red-600 hover:bg-red-50 border-red-200' },
    { label: 'Dismiss',       toId: STATUS_ID.DISMISSED,     style: 'text-gray-600 hover:bg-gray-100 border-gray-200' },
  ],
  [STATUS_ID.ACTION_TAKEN]: [
    { label: 'Re-investigate',toId: STATUS_ID.INVESTIGATING, style: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
    { label: 'Dismiss',       toId: STATUS_ID.DISMISSED,     style: 'text-gray-600 hover:bg-gray-100 border-gray-200' },
  ],
  [STATUS_ID.DISMISSED]: [],
};

const DisputeModal = ({ report: initialReport, onClose }) => {
  const queryClient = useQueryClient();
  const [report, setReport]         = useState(initialReport);
  const [description, setDescription] = useState(initialReport.description ?? '');
  const [adminNote, setAdminNote]   = useState('');
  const [patchError, setPatchError] = useState(null);

  const statusId    = report.status_code?.id;
  const statusLabel = report.status_code?.label;
  const isDismissed = statusId === STATUS_ID.DISMISSED;
  const actionButtons = BUTTONS_BY_STATUS[statusId] ?? [];

  const descChanged = description !== (report.description ?? '');

  const patch = useMutation({
    mutationFn: (payload) => reportService.resolveReport(report.id, payload),
    onSuccess: (data) => {
      setReport(data.report);
      setAdminNote('');
      setPatchError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: (err) => {
      setPatchError(
        err?.response?.data?.message ?? 'Update failed. Please try again.'
      );
    },
  });

  const handleStatusChange = (toId) => {
    setPatchError(null);
    patch.mutate({ status_id: toId, ...(adminNote ? { admin_note: adminNote } : {}) });
  };

  const handleSaveDescription = () => {
    setPatchError(null);
    patch.mutate({ description });
  };

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
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-500'}`}>
              {statusLabel ?? '—'}
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isDismissed || patch.isPending}
              rows={3}
              placeholder="No description provided."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            {!isDismissed && (
              <button
                onClick={handleSaveDescription}
                disabled={patch.isPending || !descChanged || description.length < 10}
                className="mt-2 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold transition"
              >
                Save Description
              </button>
            )}
          </div>

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

          {patchError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {patchError}
            </p>
          )}

          {actionButtons.length > 0 && (
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
                {actionButtons.map((btn) => (
                  <button
                    key={btn.label}
                    disabled={patch.isPending}
                    onClick={() => handleStatusChange(btn.toId)}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border text-xs font-semibold disabled:opacity-50 transition ${btn.style}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDismissed && (
            <p className="text-xs text-gray-400 text-center italic pt-2">This report has been dismissed and is locked.</p>
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

export default DisputeModal;
