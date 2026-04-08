import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/client';

const TEAL = '#00A389';

const fmtMMK = (v) => Number(v ?? 0).toLocaleString() + ' MMK';

const Spinner = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-800">{fmtMMK(payload[0].value)}</p>
    </div>
  );
};

const CARDS = [
  {
    key: 'total_earnings',
    label: 'Total Revenue',
    sub: 'All-time verified earnings',
    accent: 'bg-teal-50 text-teal-600',
    icon: (
      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'this_month',
    label: 'This Month',
    sub: 'Verified earnings this calendar month',
    accent: 'bg-blue-50 text-blue-500',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'pending_amount',
    label: 'Pending',
    sub: 'Payments awaiting review',
    accent: 'bg-amber-50 text-amber-500',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const OwnerAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['owner-analytics-revenue'],
    queryFn: () => apiClient.get('/owner/analytics/revenue').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your hostel revenue overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {CARDS.map(({ key, label, sub, accent, icon }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
              <p className="text-[10px] text-gray-300 mb-1">{sub}</p>
              {isLoading ? (
                <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-lg font-extrabold text-gray-900 truncate">
                  {Number(analytics?.[key] ?? 0).toLocaleString()}
                  <span className="text-xs font-medium text-gray-400 ml-1">MMK</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">
          Revenue — Last 6 Months
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center h-52 gap-3 text-teal-500">
            <Spinner /> <span className="text-sm text-gray-400">Loading chart…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={analytics?.monthly_trend ?? []}
              barSize={36}
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.split(' ')[0]}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                width={44}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f0fdf9' }} />
              <Bar dataKey="total" fill={TEAL} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OwnerAnalytics;
