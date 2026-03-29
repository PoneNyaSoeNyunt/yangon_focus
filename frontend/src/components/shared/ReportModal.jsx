import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import reportService from '../../services/reportService';

const ReportModal = ({ offenderId, offenderName, offenderRole, onClose, onSuccess }) => {
  const [categoryId, setCategoryId]   = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [errors, setErrors]           = useState({});

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey:  ['report-categories', offenderRole],
    queryFn:   () => reportService.getCategories(offenderRole),
    staleTime: 10 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (formData) => reportService.fileReport(formData),
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => setErrors(err?.response?.data?.errors ?? { general: ['Submission failed. Please try again.'] }),
  });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData();
    fd.append('offender_id', offenderId);
    fd.append('category_id', categoryId);
    if (description) fd.append('description', description);
    if (file) fd.append('evidence', file);
    mutation.mutate(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Report Issue</h2>
            {offenderName && <p className="text-xs text-gray-400 mt-0.5">Against: {offenderName}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {errors.general[0]}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={catLoading}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-60 ${
                errors.category_id ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">{catLoading ? 'Loading…' : 'Select a category…'}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what happened…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Evidence Photo</label>
            <label className={`flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition ${
              errors.evidence ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
            }`}>
              {preview ? (
                <img src={preview} alt="Evidence preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Click to upload evidence image</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            {errors.evidence && <p className="mt-1 text-xs text-red-500">{errors.evidence[0]}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold transition">
              {mutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
