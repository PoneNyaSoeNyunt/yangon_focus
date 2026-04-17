import { useState, useRef, useCallback } from 'react';

const ImageUploader = ({ files, onChange, maxFiles = 100, minFiles = 5 }) => {
  const [dragging, setDragging] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const inputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const accepted = Array.from(incoming).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    const merged = [...files, ...accepted].slice(0, maxFiles);
    onChange(merged);
  }, [files, onChange, maxFiles]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange(updated);
    setLightboxIdx(null);
  };

  const makePrimary = (idx) => {
    if (idx === 0) return;
    const updated = [...files];
    const [moved] = updated.splice(idx, 1);
    updated.unshift(moved);
    onChange(updated);
    setLightboxIdx(0);
  };

  const previewUrl = (file) => URL.createObjectURL(file);

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          dragging
            ? 'border-teal-400 bg-teal-50'
            : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">
          Drag & drop images here, or <span className="text-teal-600">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — up to {maxFiles} images (min {minFiles})</p>
      </div>

      {files.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">
            {files.length} image{files.length !== 1 ? 's' : ''} selected
            {files.length < minFiles && (
              <span className="text-amber-500 ml-2">({minFiles - files.length} more needed)</span>
            )}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {files.map((file, idx) => (
              <div key={idx} className="relative group aspect-square">
                <button
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="w-full h-full"
                >
                  <img
                    src={previewUrl(file)}
                    alt=""
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  {idx === 0 && files.length > 1 && (
                    <span className="absolute top-1 left-1 bg-teal-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxIdx !== null && files[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={previewUrl(files[lightboxIdx])}
                alt=""
                className="w-full max-h-[60vh] object-contain bg-gray-100"
              />
              {lightboxIdx === 0 && files.length > 1 && (
                <span className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => setLightboxIdx(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 p-4">
              <button
                type="button"
                onClick={() => makePrimary(lightboxIdx)}
                disabled={lightboxIdx === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-teal-500 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                {lightboxIdx === 0 ? 'Already Primary' : 'Make Primary'}
              </button>
              <button
                type="button"
                onClick={() => removeFile(lightboxIdx)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-400 text-red-500 text-sm font-semibold hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
