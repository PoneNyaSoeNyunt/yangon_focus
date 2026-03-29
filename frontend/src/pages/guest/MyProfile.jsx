import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const InputField = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      id={id}
      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400 ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SuccessAlert = ({ message }) => (
  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
    {message}
  </div>
);

const MyProfile = () => {
  const { user, login } = useAuth();
  const isSuspended = user?.user_status_id === 2;
  const [form, setForm]   = useState({ full_name: '', phone_number: '', nrc_number: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileErrors, setProfileErrors]   = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordErrors, setPasswordErrors]   = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name ?? '', phone_number: user.phone_number ?? '', nrc_number: user.nrc_number ?? '' });
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: (data) => apiClient.patch('/user/profile', data).then((r) => r.data),
    onSuccess: (data) => {
      if (data.user) login(data.user, localStorage.getItem('yf_token'));
      setProfileErrors({});
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err) => setProfileErrors(err?.response?.data?.errors ?? {}),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => apiClient.patch('/user/password', data).then((r) => r.data),
    onSuccess: () => {
      setPasswordErrors({});
      setPasswordSuccess('Password changed successfully.');
      setTimeout(() => setPasswordSuccess(''), 3000);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    },
    onError: (err) => {
      const errors  = err?.response?.data?.errors ?? {};
      const message = err?.response?.data?.message ?? '';
      if (Object.keys(errors).length > 0) setPasswordErrors(errors);
      else setPasswordErrors({ current_password: message || 'Password change failed.' });
    },
  });

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your personal information</p>
      </div>

      <div className="space-y-5">
        {/* ── Personal Information ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-teal-700">{user?.full_name?.charAt(0) ?? 'G'}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-teal-600">Guest</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(form); }} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Personal Information</h2>

            {profileSuccess && <SuccessAlert message={profileSuccess} />}

            <InputField label="Full Name"     id="full_name"     type="text"
              value={form.full_name}     onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              error={profileErrors.full_name?.[0]} disabled={isSuspended} />
            <InputField label="Phone Number"  id="phone_number"  type="text"
              value={form.phone_number}  onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              error={profileErrors.phone_number?.[0]} disabled={isSuspended} />
            <InputField label="NRC Number"    id="nrc_number"    type="text"
              value={form.nrc_number}    onChange={(e) => setForm((f) => ({ ...f, nrc_number: e.target.value }))}
              error={profileErrors.nrc_number?.[0]} disabled={isSuspended} />

            <div className="pt-1">
              <button type="submit" disabled={profileMutation.isPending || isSuspended}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">
                {profileMutation.isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            setPasswordSuccess('');
            if (pwForm.password !== pwForm.password_confirmation) {
              setPasswordErrors({ password_confirmation: 'Passwords do not match.' });
              return;
            }
            setPasswordErrors({});
            passwordMutation.mutate(pwForm);
          }} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">Change Password</h2>

            {passwordSuccess && <SuccessAlert message={passwordSuccess} />}

            <InputField label="Current Password"      id="current_password"      type="password"
              value={pwForm.current_password}      onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
              error={Array.isArray(passwordErrors.current_password) ? passwordErrors.current_password[0] : passwordErrors.current_password} />
            <InputField label="New Password"          id="password"              type="password"
              value={pwForm.password}              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              error={passwordErrors.password?.[0]} />
            <InputField label="Confirm New Password"  id="password_confirmation" type="password"
              value={pwForm.password_confirmation} onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              error={Array.isArray(passwordErrors.password_confirmation) ? passwordErrors.password_confirmation[0] : passwordErrors.password_confirmation} />

            <div className="pt-1">
              <button type="submit" disabled={passwordMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {passwordMutation.isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
