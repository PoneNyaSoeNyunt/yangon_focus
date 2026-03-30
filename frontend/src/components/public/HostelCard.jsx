import { Link } from 'react-router-dom';

const TYPE_STYLES = {
  'Male Only':   'bg-blue-100 text-blue-700',
  'Female Only': 'bg-pink-100 text-pink-700',
  'Mixed':       'bg-purple-100 text-purple-700',
};

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect fill="%23f1f5f9" width="400" height="260"/><path d="M160 130 L200 100 L240 130 L240 170 H160 Z" fill="%23cbd5e1"/><rect x="185" y="145" width="30" height="25" fill="%2394a3b8"/></svg>';

const HostelCard = ({ hostel }) => {
  const imageUrl = hostel.primary_image?.image_url ?? PLACEHOLDER;
  const minPrice = hostel.rooms_min_price_per_month;
  const maxPrice = hostel.rooms_max_price_per_month;
  const hasRange = maxPrice != null && minPrice != null && Number(maxPrice) !== Number(minPrice);

  return (
    <Link to={`/hostels/${hostel.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative overflow-hidden aspect-[16/10] flex-shrink-0">
        <img
          src={imageUrl}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {hostel.type && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[hostel.type] ?? 'bg-gray-100 text-gray-600'}`}>
            {hostel.type}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{hostel.township?.name ?? '—'}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 line-clamp-2">
          {hostel.name}
        </h3>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            {minPrice != null ? (
              <>
                <span className="text-xs text-gray-400">price</span>
                <p className="text-base font-bold text-teal-600 leading-tight">
                  {hasRange
                    ? `${Number(minPrice).toLocaleString()} – ${Number(maxPrice).toLocaleString()}`
                    : Number(minPrice).toLocaleString()}
                  <span className="text-xs font-medium text-gray-400 ml-1">MMK/mo</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Price on request</p>
            )}
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
            View
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HostelCard;
