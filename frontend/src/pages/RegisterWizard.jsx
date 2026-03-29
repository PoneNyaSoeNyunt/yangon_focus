import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const normalizePhone = (raw) => {
  let n = raw.trim().replace(/[\s\-()]/g, '');
  if (n.startsWith('+95')) n = '0' + n.slice(3);
  else if (n.startsWith('959')) n = '09' + n.slice(3);
  return n;
};

/* ── Step Indicator ── */
const StepIndicator = ({ step, total }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          i + 1 < step  ? 'bg-teal-500 text-white' :
          i + 1 === step ? 'bg-teal-500 text-white ring-4 ring-teal-100' :
          'bg-gray-100 text-gray-400'
        }`}>
          {i + 1 < step ? '✓' : i + 1}
        </div>
        {i < total - 1 && <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-teal-400' : 'bg-gray-200'}`} />}
      </div>
    ))}
  </div>
);

/* ── Role Card ── */
const RoleCard = ({ emoji, title, badge, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-md transition-all duration-200"
  >
    <div className="text-3xl mb-3">{emoji}</div>
    <div className="flex items-center gap-2 mb-1">
      <p className="font-bold text-gray-900 text-base">{title}</p>
      {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{badge}</span>}
    </div>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    <p className="mt-3 text-teal-600 text-sm font-semibold group-hover:underline">Select →</p>
  </button>
);

/* ── Shared Input ── */
const Field = ({ label, id, error, iconPath, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {iconPath && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      )}
      <input
        id={id}
        className={`w-full ${iconPath ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

/* ── Password Input ── */
const PwField = ({ label, id, name, value, onChange, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <input
          id={id} name={name} type={show ? 'text' : 'password'}
          autoComplete="new-password" placeholder={placeholder}
          value={value} onChange={onChange}
          className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {show
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
            }
          </svg>
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

/* ── Step 1: Role Selection ── */
const StepRoleSelect = ({ onSelect }) => (
  <div>
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">How will you use Yangon Focus?</h2>
      <p className="text-sm text-gray-500 mt-1">Choose the option that best describes you.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RoleCard
        emoji="🛏️" title="Hostel Seeker"
        description="Find and book beds in hostels across Yangon."
        onClick={() => onSelect('guest')}
      />
      <RoleCard
        emoji="🏠" title="Hostel Owner" badge="Owner"
        description="List your property and manage bookings and renters."
        onClick={() => onSelect('owner')}
      />
    </div>
  </div>
);

/* ── Step 2: Basic Info ── */
const StepBasicInfo = ({ role, onBack, onRegistered }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone_number: '', nrc_number: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => { login(data.user, data.token); onRegistered(); },
    onError: (err) => setErrors(err?.response?.data?.errors ?? { _general: [err?.response?.data?.message ?? 'Registration failed.'] }),
  });

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined, _general: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = ['Full name is required.'];
    if (!form.phone_number.trim()) errs.phone_number = ['Phone number is required.'];
    if (!form.password) errs.password = ['Password is required.'];
    else if (form.password.length < 8) errs.password = ['Password must be at least 8 characters.'];
    if (form.password !== form.password_confirmation) errs.password_confirmation = ['Passwords do not match.'];
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate({ full_name: form.full_name.trim(), phone_number: normalizePhone(form.phone_number), nrc_number: form.nrc_number.trim() || undefined, password: form.password, password_confirmation: form.password_confirmation, role });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mb-4 transition">← Back</button>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Registering as a <span className="font-semibold text-teal-600">{role === 'guest' ? 'Hostel Seeker' : 'Hostel Owner'}</span>
        </p>
      </div>

      {errors._general && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{errors._general[0]}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" id="full_name" name="full_name" type="text" autoComplete="name" placeholder="Ma Thida Aung"
          value={form.full_name} onChange={set('full_name')} error={errors.full_name?.[0]}
          iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <Field label="Phone Number" id="phone_number" name="phone_number" type="tel" autoComplete="tel" placeholder="09xxxxxxxxx"
          value={form.phone_number} onChange={set('phone_number')} error={errors.phone_number?.[0]}
          iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        <Field label="NRC Number (Optional)" id="nrc_number" name="nrc_number" type="text" placeholder="12/ABCDE(N)000000"
          value={form.nrc_number} onChange={set('nrc_number')} error={errors.nrc_number?.[0]}
          iconPath="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        <PwField label="Password" id="password" name="password" placeholder="Min. 8 characters"
          value={form.password} onChange={set('password')} error={errors.password?.[0]} />
        <PwField label="Confirm Password" id="password_confirmation" name="password_confirmation" placeholder="Repeat your password"
          value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation?.[0]} />

        <button type="submit" disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {mutation.isPending
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating Account...</>
            : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

/* ── Step 3: Owner Onboarding ── */
const StepOwnerOnboarding = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto">
        Welcome to Yangon Focus. Would you like to list your property now?
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate('/owner/hostels/new')}
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition shadow-md">
          Yes, List Property
        </button>
        <button onClick={() => navigate('/owner/hostels')}
          className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition">
          Skip for Now
        </button>
      </div>
    </div>
  );
};

/* ── Guest Success ── */
const GuestSuccess = () => (
  <div className="text-center py-6">
    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="font-bold text-gray-900 text-lg">Account Created!</p>
    <p className="text-sm text-gray-400 mt-1">Redirecting you to your dashboard…</p>
    <svg className="w-5 h-5 text-teal-400 animate-spin mx-auto mt-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
);

/* ── Main Wizard ── */
const RegisterWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [guestDone, setGuestDone] = useState(false);

  useEffect(() => {
    if (guestDone) {
      const t = setTimeout(() => navigate('/guest/bookings'), 1500);
      return () => clearTimeout(t);
    }
  }, [guestDone, navigate]);

  const handleRoleSelect = (r) => { setRole(r); setStep(2); };

  const handleRegistered = () => {
    if (role === 'owner') setStep(3);
    else setGuestDone(true);
  };

  const totalSteps = role === 'owner' ? 3 : 2;

  const STEP_SUBTITLES = {
    1: 'Choose how you want to use Yangon Focus',
    2: 'Fill in your account details',
    3: 'Welcome aboard!',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium mb-6 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <h1 className="text-3xl font-bold text-teal-600 tracking-tight">Yangon Focus</h1>
          </Link>
          <p className="mt-1 text-sm text-teal-700 font-medium">Hostel Management Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Create your account</h2>
            <p className="text-teal-100 text-sm mt-0.5">{STEP_SUBTITLES[step]}</p>
          </div>

          <div className="px-6 py-6">
            {step === 2 && <StepIndicator step={2} total={totalSteps} />}

            {guestDone    ? <GuestSuccess />
            : step === 1  ? <StepRoleSelect onSelect={handleRoleSelect} />
            : step === 2  ? <StepBasicInfo role={role} onBack={() => setStep(1)} onRegistered={handleRegistered} />
            :               <StepOwnerOnboarding />}
          </div>
        </div>

        {!guestDone && step !== 3 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium transition">Sign in here</Link>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-teal-700/60 mt-4">
          © {new Date().getFullYear()} Yangon Focus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterWizard;
