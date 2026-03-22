import { useState } from 'react';

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 10000;

const fmt = (val) => val === 0 ? 'Any' : `${(val / 1000).toFixed(0)}k MMK`;

const SearchBar = ({ filters, onChange, townships }) => {
  const [priceMin, setPriceMin] = useState(filters.min_price ?? PRICE_MIN);
  const [priceMax, setPriceMax] = useState(filters.max_price ?? PRICE_MAX);

  const commit = (key, val) => onChange({ ...filters, [key]: val });

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), priceMax - PRICE_STEP);
    setPriceMin(val);
    onChange({ ...filters, min_price: val || undefined, max_price: priceMax < PRICE_MAX ? priceMax : undefined });
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), priceMin + PRICE_STEP);
    setPriceMax(val);
    onChange({ ...filters, min_price: priceMin || undefined, max_price: val < PRICE_MAX ? val : undefined });
  };

  const handleReset = () => {
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    onChange({});
  };

  const hasFilters = filters.township_id || filters.type || filters.min_price || filters.max_price;

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
        }
        .range-thumb::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px rgba(20,184,166,0.25); }
        .range-thumb::-webkit-slider-runnable-track { height: 0; background: transparent; }
        .range-thumb { -webkit-appearance: none; appearance: none; background: transparent; outline: none; }
      `}</style>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6">
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
            <div className="relative pt-2 pb-1">
              <div className="absolute top-[18px] left-0 right-0 h-1.5 rounded-full bg-gray-200" />
              <div
                className="absolute top-[18px] h-1.5 rounded-full bg-teal-400"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <div className="relative h-6">
                <input
                  type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                  value={priceMin}
                  onChange={handleMinChange}
                  className="range-thumb absolute w-full h-6"
                  style={{ zIndex: priceMin >= PRICE_MAX - PRICE_STEP ? 5 : 3 }}
                />
                <input
                  type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                  value={priceMax}
                  onChange={handleMaxChange}
                  className="range-thumb absolute w-full h-6"
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>0</span>
                <span>125k</span>
                <span>250k</span>
                <span>375k</span>
                <span>500k</span>
              </div>
            </div>
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
