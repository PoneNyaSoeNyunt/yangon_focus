import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';

const TABS = ['Open', 'Resolved'];

const TAB_STYLES = {
  Open:     { active: 'bg-teal-500 text-white shadow-sm', dot: 'bg-teal-400' },
  Resolved: { active: 'bg-green-500 text-white shadow-sm',  dot: 'bg-green-400' },
};

const HelpDesk = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Open');
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => adminService.getComments(),
    staleTime: 0,
  });

  const comments   = data?.comments ?? [];
  const statusLabel = (c) => c.status_code?.label ?? '';

  const filtered = comments.filter((c) => statusLabel(c) === activeTab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = comments.filter((c) => statusLabel(c) === t).length;
    return acc;
  }, {});

  const resolveMutation = useMutation({
    mutationFn: (id) => adminService.resolveComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
        <p className="text-sm text-gray-500 mt-0.5">Support inquiries submitted by guests and owners</p>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === t
                ? TAB_STYLES[t].active
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {t}
            <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-bold px-1.5 ${
              activeTab === t ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-400">Loading inquiries…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No {activeTab.toLowerCase()} inquiries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      activeTab === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeTab === 'Open' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      {statusLabel(c)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                </div>

                {activeTab === 'Open' && (
                  <button
                    onClick={() => resolveMutation.mutate(c.id)}
                    disabled={resolveMutation.isPending && resolveMutation.variables === c.id}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                  >
                    {resolveMutation.isPending && resolveMutation.variables === c.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Resolve
                  </button>
                )}
              </div>

              <div className="px-6 pb-4 space-y-3">
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap">
                  {c.message}
                </p>
                {c.image_url && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1.5">Attachment</p>
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(c.image_url)}
                      className="block w-32 h-32 rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                      aria-label="View attachment"
                    >
                      <img src={c.image_url} alt="Inquiry attachment" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">
                      {c.user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.user?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.user?.phone_number ?? '—'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {c.user?.formatted_nrc && (
                    <span className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs text-gray-600 font-mono">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                      </svg>
                      {c.user.formatted_nrc}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    c.user?.role === 'Guest'
                      ? 'bg-blue-100 text-blue-700'
                      : c.user?.role === 'Owner'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.user?.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
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
            alt="Inquiry attachment"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default HelpDesk;
