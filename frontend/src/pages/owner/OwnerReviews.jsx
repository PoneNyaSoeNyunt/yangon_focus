import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

const fetchOwnerReviews = async () => {
  const res = await apiClient.get('/owner/reviews');
  return res.data;
};

const StarRating = ({ value, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ScoreBadge = ({ label, value }) => {
  if (value == null) return null;
  const pct = Math.round((value / 5) * 100);
  const color = pct >= 80 ? 'bg-teal-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}/5</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 leading-tight">
        {value > 0 ? value.toFixed(1) : '—'}
      </p>
    </div>
  </div>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const OwnerReviews = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['owner-reviews'],
    queryFn: fetchOwnerReviews,
  });

  const summary = data?.summary;
  const reviews = data?.reviews ?? [];

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-400 mt-0.5">Guest feedback across all your hostels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Average Rating"
          value={summary?.avg_rating ?? 0}
          icon={
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
        <SummaryCard
          label="Avg. Hygiene Score"
          value={summary?.avg_hygiene ?? 0}
          icon={
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <SummaryCard
          label="Avg. Service Quality"
          value={summary?.avg_service_quality ?? 0}
          icon={
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Review List */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading reviews...
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-red-500 text-sm">Failed to load reviews.</div>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Guest reviews will appear here after confirmed stays.</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-teal-700">
                      {r.guest_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.guest_name ?? 'Unknown Guest'}</p>
                    <p className="text-xs text-gray-400">{r.hostel_name ?? '—'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                </div>
              </div>

              {r.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4 pl-12">
                  "{r.comment}"
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-3 pl-12">
                <ScoreBadge label="Hygiene" value={r.hygiene_score} />
                <ScoreBadge label="Service Quality" value={r.service_quality} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;
