import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';

const STATUS_STYLES = {
  Open:     'bg-amber-100 text-amber-700',
  Resolved: 'bg-green-100 text-green-700',
};

const FILTER_TABS = ['All', 'Open', 'Resolved'];

const AdminComments = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn:  () => adminService.getComments(),
  });

  const comments = data?.comments ?? [];

  const statusLabel = (c) => c.status_code?.label ?? '';

  const filtered = activeTab === 'All'
    ? comments
    : comments.filter((c) => statusLabel(c) === activeTab);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? comments.length : comments.filter((c) => statusLabel(c) === t).length;
    return acc;
  }, {});

  const resolveMutation = useMutation({
    mutationFn: (id) => adminService.resolveComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
        <p className="text-sm text-gray-500 mt-0.5">Support inquiries submitted by guests and owners</p>
      </div>

      <div className="flex gap-2 mb-6">
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
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <svg className="w-8 h-8 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-400">Loading inquiries…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} inquiries found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[statusLabel(c)] ?? 'bg-gray-100 text-gray-500'}`}>
                      {statusLabel(c)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{c.subject}</h3>
                </div>

                {statusLabel(c) === 'Open' && (
                  <button
                    onClick={() => resolveMutation.mutate(c.id)}
                    disabled={resolveMutation.isPending && resolveMutation.variables === c.id}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                  >
                    {resolveMutation.isPending && resolveMutation.variables === c.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Mark as Resolved
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 mb-3 leading-relaxed">
                {c.message}
              </p>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700">
                    {c.user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{c.user?.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.user?.phone_number}</p>
                </div>
                <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {c.user?.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;
