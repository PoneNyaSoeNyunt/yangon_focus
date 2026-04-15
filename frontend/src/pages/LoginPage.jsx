import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ phone_number: '', password: '' });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const formatCountdown = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return m > 0
      ? `${m}m ${String(s).padStart(2, '0')}s`
      : `${s}s`;
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setGeneralError('');
      login(data.user, data.token);
      const role = data.user?.role;
      if (role === 'Super Admin') navigate('/admin/analytics');
      else if (role === 'Owner') navigate('/owner/hostels');
      else if (role === 'Guest') navigate('/guest/bookings');
      else navigate('/');
    },
    onError: (error) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message ?? 'Something went wrong.';

      if (status === 423) {
        const match = message.match(/(\d+)\s*minute/i);
        const minutes = match ? parseInt(match[1], 10) : 1;
        setLockoutSeconds(minutes * 60);
        setGeneralError('');
      } else {
        setGeneralError(message);
        setLockoutSeconds(0);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'phone_number' ? value.replace(/\D/g, '') : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setGeneralError('');
    loginMutation.mutate(form);
  };

  const isLocked = lockoutSeconds > 0;
  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium mb-6 transition"
        >
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
            <h2 className="text-lg font-semibold text-white">Sign in to your account</h2>
            <p className="text-teal-100 text-sm mt-0.5">Enter your phone number and password</p>
          </div>

          <div className="px-6 py-6 space-y-5">

            {isLocked && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Account Temporarily Locked</p>
                    <p className="text-xs text-red-600 mt-0.5">Too many failed attempts. Try again in:</p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-lg px-3 py-1.5">
                      <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 font-mono font-bold text-base tracking-widest">
                        {formatCountdown(lockoutSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generalError && !isLocked && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    value={form.phone_number}
                    onChange={handleChange}
                    disabled={isLocked || isLoading}
                    placeholder="09xxxxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLocked || isLoading}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLocked || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : isLocked ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked — {formatCountdown(lockoutSeconds)}
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

          </div>

          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium transition">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-teal-700/60 mt-6">
          © {new Date().getFullYear()} Yangon Focus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
