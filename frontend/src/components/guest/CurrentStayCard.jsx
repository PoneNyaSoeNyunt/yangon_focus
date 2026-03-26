const STATUS_STYLES = {
  'Active':    'bg-green-100 text-green-700',
  'Confirmed': 'bg-teal-100 text-teal-700',
};

const TYPE_STYLES = {
  'Male Only':   'bg-blue-100 text-blue-700',
  'Female Only': 'bg-pink-100 text-pink-700',
  'Mixed':       'bg-purple-100 text-purple-700',
};

const CurrentStayCard = ({ stay, onClick }) => {
  const statusStyle = STATUS_STYLES[stay.status] ?? 'bg-gray-100 text-gray-600';
  const typeStyle   = TYPE_STYLES[stay.hostel?.type] ?? 'bg-gray-100 text-gray-600';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {stay.hostel?.name ?? '—'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Bed&nbsp;<span className="font-semibold text-gray-600">#{stay.bed_number ?? '—'}</span>
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle}`}>
          {stay.status}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {stay.hostel?.type && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${typeStyle}`}>
              {stay.hostel.type}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-gray-800">
          {Number(stay.locked_price).toLocaleString()}
          <span className="text-xs font-normal text-gray-400"> MMK/mo</span>
        </p>
      </div>
    </div>
  );
};

export default CurrentStayCard;
