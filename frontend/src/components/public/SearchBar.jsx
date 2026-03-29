import { useState } from 'react';

const FACILITY_OPTIONS = ['WiFi', 'Aircon', 'CCTV', 'Kitchen', 'Generator'];

const PRICE_MIN = 50000;
const PRICE_MAX = 160000;
const PRICE_STEP = 5000;

const fmt = (val) => `${(val / 1000).toFixed(0)}k MMK`;

const SearchBar = ({ filters, onChange, townships }) => {
  const [priceMin, setPriceMin] = useState(filters.min_price ?? PRICE_MIN);
  const [priceMax, setPriceMax] = useState(filters.max_price ?? PRICE_MAX);

  const commit = (key, val) => onChange({ ...filters, [key]: val });

  const toggleFacility = (f) => {
    const current = filters.facilities ?? [];
    const next = current.includes(f) ? current.filter((x) => x !== f) : [...current, f];
    onChange({ ...filters, facilities: next.length ? next : undefined });
  };

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), priceMax - PRICE_STEP);
    setPriceMin(val);
    onChange({ ...filters, min_price: val > PRICE_MIN ? val : undefined, max_price: priceMax < PRICE_MAX ? priceMax : undefined });
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), priceMin + PRICE_STEP);
    setPriceMax(val);
    onChange({ ...filters, min_price: priceMin > PRICE_MIN ? priceMin : undefined, max_price: val < PRICE_MAX ? val : undefined });
  };

  const handleReset = () => {
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    onChange({});
  };

  const hasFilters = filters.name || filters.township_id || filters.type || filters.min_price || filters.max_price || filters.facilities?.length;

  const minPercent = ((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent = ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <>
      <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #14b8a6; cursor: pointer;
          border: 2px solid white; box-shadow: 0 0 0 2px #14b8a6;
          transition: box-shadow 0.15s;
          pointer-events: auto;
        }
        .range-thumb::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px rgba(20,184,166,0.25); }
        .range-thumb::-webkit-slider-runnable-track { height: 100%; background: transparent; }
        .range-thumb { -webkit-appearance: none; appearance: none; background: transparent; outline: none; pointer-events: none; }
      `}</style>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search by Name</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="e.g. Golden Land, Star Hostel…"
              value={filters.name ?? ''}
              onChange={(e) => commit('name', e.target.value || undefined)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent hover:border-gray-300 transition"
            />
            {filters.name && (
              <button
                type="button"
                onClick={() => commit('name', undefined)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Township</label>
            <select
              value={filters.township_id ?? ''}
              onChange={(e) => commit('township_id', e.target.value || undefined)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent hover:border-gray-300 transition"
            >
              <option value="">All Townships</option>
              {townships.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hostel Type</label>
            <select
              value={filters.type ?? ''}
              onChange={(e) => commit('type', e.target.value || undefined)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent hover:border-gray-300 transition"
            >
              <option value="">All Types</option>
              <option value="Male Only">Male Only</option>
              <option value="Female Only">Female Only</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Price Range
              <span className="ml-2 text-teal-600 font-bold normal-case tracking-normal">
                {fmt(priceMin)} – {fmt(priceMax)}
              </span>
            </label>
            <div className="relative h-6 my-1">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gray-200" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-teal-400"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <input
                type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                value={priceMin}
                onChange={handleMinChange}
                className="range-thumb absolute inset-0 w-full h-full"
                style={{ zIndex: priceMin >= PRICE_MAX - PRICE_STEP ? 5 : 3 }}
              />
              <input
                type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                value={priceMax}
                onChange={handleMaxChange}
                className="range-thumb absolute inset-0 w-full h-full"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>50k</span>
              <span>80k</span>
              <span>110k</span>
              <span>140k</span>
              <span>160k</span>
            </div>
          </div>

        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Facilities</label>
          <div className="flex flex-wrap gap-2">
            {FACILITY_OPTIONS.map((f) => {
              const active = (filters.facilities ?? []).includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    active
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
