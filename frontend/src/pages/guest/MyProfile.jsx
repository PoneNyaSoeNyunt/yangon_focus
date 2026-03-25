import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const MyProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm]         = useState({ full_name: '', phone_number: '', nrc_number: '' });
  const [pwForm, setPwForm]     = useState({ current_password: '', password: '', password_confirmation: '' });
  const [toast, setToast]       = useState('');
  const [toastErr, setToastErr] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name ?? '', phone_number: user.phone_number ?? '', nrc_number: user.nrc_number ?? '' });
    }
  }, [user]);

  const showToast = (msg, isErr = false) => {
    isErr ? setToastErr(msg) : setToast(msg);
    setTimeout(() => { setToast(''); setToastErr(''); }, 4000);
  };

  const profileMutation = useMutation({
    mutationFn: (data) => apiClient.patch('/user/profile', data).then((r) => r.data),
    onSuccess: (data) => {
      if (data.user) login(data.user, localStorage.getItem('yf_token'));
      showToast('Profile updated successfully.');
    },
    onError: (err) => showToast(err?.response?.data?.message ?? 'Update failed.', true),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => apiClient.patch('/user/password', data).then((r) => r.data),
    onSuccess: () => {
      showToast('Password changed successfully.');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    },
    onError: (err) => showToast(err?.response?.data?.message ?? 'Password change failed.', true),
  });

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your personal information</p>
      </div>

      {toast && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toast}
        </div>
      )}
      {toastErr && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{toastErr}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-teal-700">{user?.full_name?.charAt(0) ?? 'G'}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.full_name}</p>
            <p className="text-sm text-teal-600">Guest</p>
          </div>
        </div>

        <h2 className="text-sm font-bold text-gray-700 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input
              type="text"
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">NRC Number</label>
            <input
              type="text"
              value={form.nrc_number}
              onChange={(e) => setForm((f) => ({ ...f, nrc_number: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
        <button
          disabled={profileMutation.isPending}
          onClick={() => profileMutation.mutate(form)}
          className="mt-5 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
        >
          {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              type="password"
              value={pwForm.current_password}
              onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input
              type="password"
              value={pwForm.password}
              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.password_confirmation}
              onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
        <button
          disabled={passwordMutation.isPending}
          onClick={() => passwordMutation.mutate(pwForm)}
          className="mt-5 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
        >
          {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
