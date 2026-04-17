import { useEffect, useState } from 'react';

const ImageUploadField = ({
  file,
  onChange,
  error,
  label = 'Attach Image (optional)',
  hint = 'Click to attach a screenshot or photo',
}) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handle = (e) => {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    // reset so selecting the same file again still triggers onChange
    e.target.value = '';
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <label
        className={`relative flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Attachment preview" className="h-full w-full object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
              className="absolute top-2 right-2 bg-white/95 hover:bg-white text-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow text-sm font-bold"
              aria-label="Remove attachment"
            >
              ×
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">{hint}</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handle} className="hidden" />
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploadField;
