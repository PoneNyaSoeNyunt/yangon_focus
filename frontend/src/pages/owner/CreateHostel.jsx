import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import ownerService from '../../services/ownerService';
import ImageUploader from '../../components/owner/ImageUploader';

const STEPS = ['Basic Info', 'Rooms & Beds', 'License & Gallery'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((label, idx) => {
      const done = idx < current;
      const active = idx === current;
      return (
        <div key={idx} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
              done ? 'bg-teal-500 text-white' : active ? 'bg-teal-500 text-white ring-4 ring-teal-100' : 'bg-gray-200 text-gray-500'
            }`}>
              {done ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : idx + 1}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? 'text-teal-700' : done ? 'text-teal-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-teal-400' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);

const FieldError = ({ msg }) => msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

const InputCls = (hasErr) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400 ${
    hasErr ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
  }`;

const emptyRoom = () => ({ label: '', type_id: '', price_per_month: '', max_occupancy: '' });

const CreateHostel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editMode = !!id;

  const [step, setStep] = useState(0);
  const [hostelId, setHostelId] = useState(id ? Number(id) : null);
  const [errors, setErrors] = useState({});
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [existingRooms, setExistingRooms] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [basicForm, setBasicForm] = useState({
    name: '', description: '', address: '',
    house_rules: '', type: '', township_id: '',
  });
  const [rooms, setRooms] = useState([emptyRoom()]);
  const [licenseForm, setLicenseForm] = useState({ license_number: '', image: null });

  const { data: townships = [] } = useQuery({
    queryKey: ['townships'],
    queryFn: ownerService.getTownships,
    staleTime: Infinity,
  });
  const { data: roomTypes = [] } = useQuery({
    queryKey: ['room-types'],
    queryFn: ownerService.getRoomTypes,
    staleTime: Infinity,
  });

  const { data: existingHostel, isLoading: hostelLoading } = useQuery({
    queryKey: ['owner-hostel', id],
    queryFn: () => ownerService.getHostel(id),
    enabled: editMode,
    staleTime: 0,
  });

  useEffect(() => {
    if (!existingHostel) return;
    setBasicForm({
      name:        existingHostel.name ?? '',
      description: existingHostel.description ?? '',
      address:     existingHostel.address ?? '',
      house_rules: existingHostel.house_rules ?? '',
      type:        existingHostel.type ?? '',
      township_id: String(existingHostel.township_id ?? ''),
    });
    setExistingRooms(existingHostel.rooms ?? []);
    setExistingImages(existingHostel.images ?? []);
    const license = existingHostel.business_licenses?.[0];
    if (license) {
      setLicenseForm((f) => ({ ...f, license_number: license.license_number }));
    }
  }, [existingHostel]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markDirty = () => { if (!isDirty) setIsDirty(true); };

  const setBasicField = (field, value) => {
    setBasicForm((f) => ({ ...f, [field]: value }));
    markDirty();
  };

  const createHostelMutation = useMutation({
    mutationFn: (data) => ownerService.createHostel(data),
    onSuccess: (res) => {
      setHostelId(res.hostel.id);
      setErrors({});
      setIsDirty(false);
      setStep(1);
    },
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const updateHostelMutation = useMutation({
    mutationFn: (data) => ownerService.updateHostel(hostelId, data),
    onSuccess: () => {
      setErrors({});
      setIsDirty(false);
      setStep(1);
    },
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const addRoomsMutation = useMutation({
    mutationFn: (data) => ownerService.addRooms(hostelId, data),
    onSuccess: () => { setErrors({}); setIsDirty(false); setStep(2); },
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const licenseMutation = useMutation({
    mutationFn: () => ownerService.uploadLicense(hostelId, licenseForm.license_number, licenseForm.image),
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const imagesMutation = useMutation({
    mutationFn: () => ownerService.uploadImages(hostelId, galleryFiles),
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId) => ownerService.deleteImage(hostelId, imageId),
    onSuccess: (_, imageId) => setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId)),
  });

  const validateBasic = () => {
    const local = {};
    if (!basicForm.name.trim())    local.name = ['Name is required.'];
    if (!basicForm.address.trim()) local.address = ['Address is required.'];
    if (!basicForm.type)           local.type = ['Type is required.'];
    if (!basicForm.township_id)    local.township_id = ['Township is required.'];
    return local;
  };

  const handleBasicSubmit = (e) => {
    e.preventDefault();
    const local = validateBasic();
    if (Object.keys(local).length) { setErrors(local); return; }
    if (editMode && hostelId) { updateHostelMutation.mutate(basicForm); return; }
    if (!editMode && hostelId) { setErrors({}); setStep(1); return; }
    createHostelMutation.mutate(basicForm);
  };

  const handleRoomsSubmit = (e) => {
    e.preventDefault();
    const hasNewRooms = rooms.some((r) => r.label.trim());
    if (!hasNewRooms) { setErrors({}); setStep(2); return; }
    const local = {};
    rooms.forEach((r, i) => {
      if (!r.label.trim())         local[`rooms.${i}.label`] = ['Room label required.'];
      if (!r.type_id)              local[`rooms.${i}.type_id`] = ['Room type required.'];
      if (!r.price_per_month)      local[`rooms.${i}.price_per_month`] = ['Price required.'];
      if (!r.max_occupancy)        local[`rooms.${i}.max_occupancy`] = ['Capacity required.'];
    });
    if (Object.keys(local).length) { setErrors(local); return; }
    addRoomsMutation.mutate(rooms.filter((r) => r.label.trim()));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const local = {};
    if (!licenseForm.license_number.trim()) local.license_number = ['License number is required.'];
    if (!editMode && !licenseForm.image)    local.image = ['License image is required.'];
    const totalImages = existingImages.length + galleryFiles.length;
    if (!editMode && galleryFiles.length < 5)
      local.images = [`At least 5 gallery images required (${galleryFiles.length} selected).`];
    if (editMode && totalImages === 0)
      local.images = ['At least 1 gallery image required.'];
    if (Object.keys(local).length) { setErrors(local); return; }
    try {
      if (licenseForm.image) await licenseMutation.mutateAsync();
      if (galleryFiles.length > 0) await imagesMutation.mutateAsync();
      setIsDirty(false);
      navigate('/owner/hostels');
    } catch {}
  };

  const addRoom = () => { setRooms((r) => [...r, emptyRoom()]); markDirty(); };
  const removeRoom = (idx) => setRooms((r) => r.filter((_, i) => i !== idx));
  const updateRoom = (idx, field, value) => {
    setRooms((r) => r.map((rm, i) => (i === idx ? { ...rm, [field]: value } : rm)));
    markDirty();
  };

  const isPending =
    createHostelMutation.isPending ||
    updateHostelMutation.isPending ||
    addRoomsMutation.isPending ||
    licenseMutation.isPending ||
    imagesMutation.isPending ||
    deleteImageMutation.isPending;

  if (editMode && hostelLoading) {
    return (
      <div className="flex justify-center py-24">
        <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editMode ? 'Edit Hostel Listing' : 'New Hostel Listing'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {editMode ? 'Update your listing details' : 'Complete all 3 steps to submit your hostel'}
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {step === 0 && (
          <form onSubmit={handleBasicSubmit} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel Name *</label>
              <input
                type="text" value={basicForm.name}
                onChange={(e) => setBasicField('name', e.target.value)}
                placeholder="e.g. Sunrise Hostel"
                className={InputCls(errors.name)}
              />
              <FieldError msg={errors.name?.[0]} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={3} value={basicForm.description}
                onChange={(e) => setBasicField('description', e.target.value)}
                placeholder="Brief description of your hostel..."
                className={`${InputCls(false)} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel Type *</label>
                <select
                  value={basicForm.type}
                  onChange={(e) => setBasicField('type', e.target.value)}
                  className={InputCls(errors.type)}
                >
                  <option value="">Select type...</option>
                  <option value="Male Only">Male Only</option>
                  <option value="Female Only">Female Only</option>
                  <option value="Mixed">Mixed</option>
                </select>
                <FieldError msg={errors.type?.[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Township *</label>
                <select
                  value={basicForm.township_id}
                  onChange={(e) => setBasicField('township_id', e.target.value)}
                  className={InputCls(errors.township_id)}
                >
                  <option value="">Select township...</option>
                  {townships.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <FieldError msg={errors.township_id?.[0]} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
              <input
                type="text" value={basicForm.address}
                onChange={(e) => setBasicField('address', e.target.value)}
                placeholder="Full street address"
                className={InputCls(errors.address)}
              />
              <FieldError msg={errors.address?.[0]} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">House Rules</label>
              <textarea
                rows={3} value={basicForm.house_rules}
                onChange={(e) => setBasicField('house_rules', e.target.value)}
                placeholder="No smoking, quiet hours 10pm–7am..."
                className={`${InputCls(false)} resize-none`}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit" disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Next: Rooms & Beds
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleRoomsSubmit} className="space-y-5">
            {existingRooms.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-teal-700 mb-1.5">
                  {existingRooms.length} existing room{existingRooms.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-col gap-1">
                  {existingRooms.map((r) => (
                    <span key={r.id} className="text-xs text-teal-600">
                      {r.label} — {r.max_occupancy} bed{r.max_occupancy !== 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-teal-500 mt-2 italic">Use the form below to add more rooms.</p>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {existingRooms.length > 0 ? 'Add More Rooms' : 'Room & Bed Configuration'}
              </h2>
              <button
                type="button" onClick={addRoom}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Room
              </button>
            </div>

            {rooms.map((room, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">Room {existingRooms.length + idx + 1}</span>
                  {rooms.length > 1 && (
                    <button
                      type="button" onClick={() => removeRoom(idx)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Room Label *</label>
                    <input
                      type="text" value={room.label}
                      onChange={(e) => updateRoom(idx, 'label', e.target.value)}
                      placeholder="e.g. Room A, Dorm 1"
                      className={InputCls(errors[`rooms.${idx}.label`])}
                    />
                    <FieldError msg={errors[`rooms.${idx}.label`]?.[0]} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Room Type *</label>
                    <select
                      value={room.type_id}
                      onChange={(e) => updateRoom(idx, 'type_id', e.target.value)}
                      className={InputCls(errors[`rooms.${idx}.type_id`])}
                    >
                      <option value="">Select type...</option>
                      {roomTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <FieldError msg={errors[`rooms.${idx}.type_id`]?.[0]} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price / Month (MMK) *</label>
                    <input
                      type="number" min="0" value={room.price_per_month}
                      onChange={(e) => updateRoom(idx, 'price_per_month', e.target.value)}
                      placeholder="e.g. 150000"
                      className={InputCls(errors[`rooms.${idx}.price_per_month`])}
                    />
                    <FieldError msg={errors[`rooms.${idx}.price_per_month`]?.[0]} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Max Capacity *
                      <span className="text-gray-400 font-normal ml-1">(beds auto-generated)</span>
                    </label>
                    <input
                      type="number" min="1" max="20" value={room.max_occupancy}
                      onChange={(e) => updateRoom(idx, 'max_occupancy', e.target.value)}
                      placeholder="e.g. 4"
                      className={InputCls(errors[`rooms.${idx}.max_occupancy`])}
                    />
                    <FieldError msg={errors[`rooms.${idx}.max_occupancy`]?.[0]} />
                  </div>
                </div>

                {room.max_occupancy > 0 && (
                  <p className="text-xs text-teal-600 font-medium">
                    ✓ {room.max_occupancy} bed{Number(room.max_occupancy) !== 1 ? 's' : ''} will be created automatically
                  </p>
                )}
              </div>
            ))}

            <div className="pt-2 flex justify-between">
              <button
                type="button" onClick={() => setStep(0)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit" disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Next: License & Gallery
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Business License</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number *</label>
                  <input
                    type="text" value={licenseForm.license_number}
                    onChange={(e) => setLicenseForm((f) => ({ ...f, license_number: e.target.value }))}
                    placeholder="e.g. BL-2024-00123"
                    className={InputCls(errors.license_number)}
                  />
                  <FieldError msg={errors.license_number?.[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">License Scan *</label>
                  <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition ${
                    errors.image ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-500 truncate">
                      {licenseForm.image ? licenseForm.image.name : 'Upload JPG, PNG or PDF (max 5MB)'}
                    </span>
                    <input
                      type="file" className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setLicenseForm((f) => ({ ...f, image: e.target.files[0] ?? null }))}
                    />
                  </label>
                  <FieldError msg={errors.image?.[0]} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Property Gallery</h2>

              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {existingImages.length} existing image{existingImages.length !== 1 ? 's' : ''} — click × to remove
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={img.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-teal-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteImageMutation.mutate(img.id)}
                          disabled={deleteImageMutation.isPending}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ImageUploader
                files={galleryFiles}
                onChange={setGalleryFiles}
                minFiles={editMode ? 0 : 5}
                maxFiles={100}
              />
              <FieldError msg={errors.images?.[0]} />
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button" onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit" disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Submit Listing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateHostel;
