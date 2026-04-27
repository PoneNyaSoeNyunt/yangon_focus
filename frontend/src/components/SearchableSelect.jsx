import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Lightweight searchable single-select combobox.
 * Replaces the native <select> for long option lists so the popup
 * can't stretch beyond the viewport.
 *
 * Props:
 *   options     [{ value, label }]
 *   value       currently selected value (string|number)
 *   onChange    (newValue) => void
 *   placeholder string shown when nothing selected
 *   disabled    bool
 *   error       error message string
 *   id          html id for the trigger
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  error = '',
  id,
}) => {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef   = useRef(null);
  const searchRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  /* Focus search when opening + reset state */
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const commit = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) commit(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full max-w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-left truncate relative ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:border-gray-300'
        } ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      >
        <span className="text-gray-900">
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          onKeyDown={onKeyDown}
        >
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
              onKeyDown={onKeyDown}
              placeholder="Search…"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400">No results.</li>
            ) : filtered.map((opt, idx) => {
              const isSel = selected && String(selected.value) === String(opt.value);
              const isHi  = idx === highlight;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => commit(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer truncate ${
                    isHi ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                  } ${isSel ? 'font-semibold' : ''}`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
