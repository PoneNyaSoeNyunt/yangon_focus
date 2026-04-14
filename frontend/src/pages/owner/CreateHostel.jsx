import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import ownerService from '../../services/ownerService';
import ImageUploader from '../../components/owner/ImageUploader';

const STEPS = ['Basic Info', 'Rooms & Beds', 'License & Gallery'];

const FACILITIES = [
  { key: 'WiFi',         icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
  { key: 'Aircon',       icon: 'M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M1 12h1m18 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z' },
  { key: 'CCTV',         icon: 'M15 10l4.553-2.07A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { key: 'Kitchen',      icon: 'M3 6h18M3 12h18M3 18h18' },
  { key: 'Generator',    icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

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
  const [roomEdits, setRoomEdits] = useState({});
  const [roomSaveState, setRoomSaveState] = useState({});

  const [basicForm, setBasicForm] = useState({
    name: '', description: '', address: '',
    house_rules: '', type: '', township_id: '', facilities: [],
    payment_methods: [],
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
    if (!existingRooms.length) return;
    setRoomEdits((prev) => {
      const next = { ...prev };
      existingRooms.forEach((r) => {
        if (!(r.id in next)) {
          next[r.id] = {
            label:           r.label ?? '',
            type_id:         String(r.type_id ?? ''),
            price_per_month: String(r.price_per_month ?? ''),
            max_occupancy:   String(r.max_occupancy ?? ''),
          };
        }
      });
      return next;
    });
  }, [existingRooms]);

  useEffect(() => {
    if (!existingHostel) return;
    setBasicForm({
      name:            existingHostel.name ?? '',
      description:     existingHostel.description ?? '',
      address:         existingHostel.address ?? '',
      house_rules:     existingHostel.house_rules ?? '',
      type:            existingHostel.type ?? '',
      township_id:     String(existingHostel.township_id ?? ''),
      facilities:      existingHostel.facilities ?? [],
      payment_methods: (existingHostel.payment_methods ?? []).map((pm) => ({
        method_name:    pm.method_name,
        account_number: pm.account_number,
        account_name:   pm.account_name,
      })),
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

  const saveRoom = async (roomId) => {
    const data = roomEdits[roomId];
    setRoomSaveState((s) => ({ ...s, [roomId]: { loading: true, error: null, success: false } }));
    try {
      const res = await ownerService.updateRoom(roomId, {
        label:           data.label,
        type_id:         Number(data.type_id),
        price_per_month: Number(data.price_per_month),
        max_occupancy:   Number(data.max_occupancy),
      });
      setExistingRooms((rooms) =>
        rooms.map((r) => r.id === roomId ? { ...r, ...res.room } : r)
      );
      setRoomSaveState((s) => ({ ...s, [roomId]: { loading: false, error: null, success: true } }));
      setTimeout(() =>
        setRoomSaveState((s) => ({ ...s, [roomId]: { ...(s[roomId] ?? {}), success: false } })),
        2500
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        Object.values(err?.response?.data?.errors ?? {})[0]?.[0] ??
        'Failed to save room.';
      setRoomSaveState((s) => ({ ...s, [roomId]: { loading: false, error: msg, success: false } }));
    }
  };

  const toggleFacility = (key) => {
    setBasicForm((f) => {
      const has = f.facilities.includes(key);
      return { ...f, facilities: has ? f.facilities.filter((k) => k !== key) : [...f.facilities, key] };
    });
    markDirty();
  };

  const addPaymentMethod = () => {
    setBasicForm((f) => ({
      ...f,
      payment_methods: [...f.payment_methods, { method_name: '', account_number: '', account_name: '' }],
    }));
    markDirty();
  };

  const updatePaymentMethod = (index, field, value) => {
    setBasicForm((f) => {
      const updated = f.payment_methods.map((pm, i) => i === index ? { ...pm, [field]: value } : pm);
      return { ...f, payment_methods: updated };
    });
    markDirty();
  };

  const removePaymentMethod = (index) => {
    setBasicForm((f) => ({
      ...f,
      payment_methods: f.payment_methods.filter((_, i) => i !== index),
    }));
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
    onSuccess: (res) => {
      setErrors({});
      setIsDirty(false);
      setExistingRooms((prev) => [...prev, ...(res.rooms ?? [])]);
      setRooms([emptyRoom()]);
      setStep(2);
    },
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId) => ownerService.deleteRoom(roomId),
    onSuccess: (_, roomId) => {
      setExistingRooms((prev) => prev.filter((r) => r.id !== roomId));
      setRoomEdits((prev) => { const next = { ...prev }; delete next[roomId]; return next; });
      setRoomSaveState((prev) => { const next = { ...prev }; delete next[roomId]; return next; });
    },
  });

  const licenseMutation = useMutation({
    mutationFn: () => ownerService.uploadLicense(hostelId, licenseForm.license_number, licenseForm.image),
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const imagesMutation = useMutation({
    mutationFn: () => ownerService.uploadImages(hostelId, galleryFiles),
    onError: (err) => setErrors(err?.response?.data?.errors ?? {}),
  });

  const [lightboxImage, setLightboxImage] = useState(null);

  const deleteImageMutation = useMutation({
    mutationFn: (imageId) => ownerService.deleteImage(hostelId, imageId),
    onSuccess: (_, imageId) => {
      setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId));
      setLightboxImage(null);
    },
  });

  const makePrimaryMutation = useMutation({
    mutationFn: (imageId) => ownerService.makeImagePrimary(hostelId, imageId),
    onSuccess: (_, imageId) => {
      setExistingImages((imgs) =>
        imgs.map((i) => ({ ...i, is_primary: i.id === imageId }))
      );
      setLightboxImage((prev) => prev ? { ...prev, is_primary: true } : null);
    },
  });

  const validateBasic = () => {
    const local = {};
    if (!basicForm.name.trim())    local.name = ['Name is required.'];
    if (!basicForm.address.trim()) local.address = ['Address is required.'];
    if (!basicForm.type)           local.type = ['Type is required.'];
    if (!basicForm.township_id)    local.township_id = ['Township is required.'];
    basicForm.payment_methods.forEach((pm, i) => {
      if (!pm.method_name.trim())    local[`payment_methods.${i}.method_name`] = ['Method name is required.'];
      if (!pm.account_number.trim()) local[`payment_methods.${i}.account_number`] = ['Account number is required.'];
      if (!pm.account_name.trim())   local[`payment_methods.${i}.account_name`] = ['Account name is required.'];
    });
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
    deleteImageMutation.isPending ||
    makePrimaryMutation.isPending;

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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/owner/hostels')}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition flex-shrink-0"
          aria-label="Back"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {editMode ? 'Edit Hostel Listing' : 'New Hostel Listing'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {editMode ? 'Update your listing details' : 'Complete all 3 steps to submit your hostel'}
          </p>
        </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {FACILITIES.map(({ key, icon }) => {
                  const selected = basicForm.facilities.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFacility(key)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-xs font-medium transition ${
                        selected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                      </svg>
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Online Payment Setup</label>
                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Method
                </button>
              </div>
              {basicForm.payment_methods.length === 0 && (
                <p className="text-xs text-gray-400 italic mb-2">No payment methods added yet. Guests will only see "Pay at Property" (Cash).</p>
              )}
              <div className="space-y-3">
                {basicForm.payment_methods.map((pm, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex flex-col sm:grid sm:grid-cols-7 gap-2 sm:items-center">
                      <input
                        type="text"
                        placeholder="Method (e.g. KBZPay)"
                        value={pm.method_name}
                        onChange={(e) => updatePaymentMethod(i, 'method_name', e.target.value)}
                        className={`sm:col-span-2 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                          errors[`payment_methods.${i}.method_name`] ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Phone / Account No."
                        value={pm.account_number}
                        onChange={(e) => updatePaymentMethod(i, 'account_number', e.target.value)}
                        className={`sm:col-span-2 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                          errors[`payment_methods.${i}.account_number`] ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Account Name"
                        value={pm.account_name}
                        onChange={(e) => updatePaymentMethod(i, 'account_name', e.target.value)}
                        className={`sm:col-span-2 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                          errors[`payment_methods.${i}.account_name`] ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(i)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition self-end sm:self-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {(errors[`payment_methods.${i}.method_name`] || errors[`payment_methods.${i}.account_number`] || errors[`payment_methods.${i}.account_name`]) && (
                      <p className="text-xs text-red-500 px-1">
                        {(errors[`payment_methods.${i}.method_name`] ?? errors[`payment_methods.${i}.account_number`] ?? errors[`payment_methods.${i}.account_name`])?.[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
              <div className="space-y-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Existing Rooms ({existingRooms.length})
                </h3>
                {existingRooms.map((r) => {
                  const edit      = roomEdits[r.id] ?? {};
                  const saveState = roomSaveState[r.id] ?? {};
                  const occupiedCount = r.beds?.filter((b) => b.is_occupied).length ?? 0;
                  return (
                    <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Room Label *</label>
                          <input
                            type="text"
                            value={edit.label ?? ''}
                            onChange={(e) => setRoomEdits((s) => ({ ...s, [r.id]: { ...s[r.id], label: e.target.value } }))}
                            className={InputCls(false)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Room Type *</label>
                          <select
                            value={edit.type_id ?? ''}
                            onChange={(e) => setRoomEdits((s) => ({ ...s, [r.id]: { ...s[r.id], type_id: e.target.value } }))}
                            className={InputCls(false)}
                          >
                            <option value="">Select type...</option>
                            {roomTypes.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price / Month (MMK) *</label>
                          <input
                            type="number" min="0"
                            value={edit.price_per_month ?? ''}
                            onChange={(e) => setRoomEdits((s) => ({ ...s, [r.id]: { ...s[r.id], price_per_month: e.target.value } }))}
                            className={InputCls(false)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Max Capacity *
                            {occupiedCount > 0 && (
                              <span className="ml-1 text-amber-600 font-normal">({occupiedCount} occupied)</span>
                            )}
                          </label>
                          <input
                            type="number" min={Math.max(occupiedCount, 1)} max="50"
                            value={edit.max_occupancy ?? ''}
                            onChange={(e) => setRoomEdits((s) => ({ ...s, [r.id]: { ...s[r.id], max_occupancy: e.target.value } }))}
                            className={InputCls(false)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 text-xs">
                          {saveState.error && <p className="text-red-500">{saveState.error}</p>}
                          {saveState.success && <p className="text-teal-600 font-medium">✓ Saved successfully</p>}
                          {deleteRoomMutation.isPending && deleteRoomMutation.variables === r.id && (
                            <p className="text-red-400">Removing…</p>
                          )}
                          {occupiedCount > 0 && (
                            <p className="text-amber-500">Room has occupied beds — cannot remove.</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={occupiedCount > 0 || (deleteRoomMutation.isPending && deleteRoomMutation.variables === r.id)}
                            onClick={() => deleteRoomMutation.mutate(r.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-500 text-xs font-semibold rounded-xl border border-red-200 transition"
                            title={occupiedCount > 0 ? 'Cannot remove: beds are occupied' : 'Remove this room'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                          <button
                            type="button"
                            disabled={saveState.loading}
                            onClick={() => saveRoom(r.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition"
                          >
                            {saveState.loading ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-400 italic">Use the form below to add more rooms.</p>
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
                    {existingImages.length} existing image{existingImages.length !== 1 ? 's' : ''} — click to view
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setLightboxImage(img)}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-teal-400 transition"
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-teal-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {lightboxImage && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                  onClick={() => setLightboxImage(null)}
                >
                  <div
                    className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <img
                        src={lightboxImage.image_url}
                        alt=""
                        className="w-full max-h-[60vh] object-contain bg-gray-100"
                      />
                      {lightboxImage.is_primary && (
                        <span className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => makePrimaryMutation.mutate(lightboxImage.id)}
                        disabled={lightboxImage.is_primary || makePrimaryMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-teal-500 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {makePrimaryMutation.isPending ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                          </svg>
                        )}
                        {lightboxImage.is_primary ? 'Already Primary' : 'Make Primary'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteImageMutation.mutate(lightboxImage.id)}
                        disabled={deleteImageMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-400 text-red-500 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteImageMutation.isPending ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Delete
                      </button>
                    </div>
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
