import { useState, useRef, useCallback } from 'react';

const ImageUploader = ({ files, onChange, maxFiles = 100, minFiles = 5 }) => {
  const [dragging, setDragging] = useState(false);
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
                <img
                  src={previewUrl(file)}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border border-gray-200"
                />
                {idx === 0 && (
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-teal-500 text-white px-1.5 py-0.5 rounded-md font-semibold">
                    Primary
                  </span>
                )}
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
    </div>
  );
};

export default ImageUploader;
