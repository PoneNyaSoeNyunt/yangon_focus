import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import UseDebounce from '../../hooks/UseDebounce';

const ROLES = {
  Guest: { label: 'Guest', color: 'bg-blue-100 text-blue-700' },
  Owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700' },
  'Super Admin': { label: 'Super Admin', color: 'bg-amber-100 text-amber-700' },
};

const STATUS_STYLES = {
  'Active':               'bg-green-100 text-green-700',
  'Suspended':            'bg-yellow-100 text-yellow-700',
  'Blacklisted':          'bg-red-100 text-red-700',
  'Pending Verification': 'bg-gray-100 text-gray-500',
};

const ACTION_BUTTONS = [
  { label: 'Activate',   status: 'Active',      style: 'text-green-700 hover:bg-green-50' },
  { label: 'Suspend',    status: 'Suspended',   style: 'text-yellow-700 hover:bg-yellow-50' },
  { label: 'Blacklist',  status: 'Blacklisted', style: 'text-red-700 hover:bg-red-50' },
];

const ActionMenu = ({ userId, currentStatus, onAction, isPending }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isPending ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        )}
        Actions
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1 overflow-hidden">
          {ACTION_BUTTONS.filter((a) => a.status !== currentStatus).map((a) => (
            <button
              key={a.status}
              onClick={() => { setOpen(false); onAction(userId, a.status); }}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium transition ${a.style}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 15;

  const debouncedSearch = UseDebounce(search, 400);

  const filters = {
    ...(debouncedSearch   && { search: debouncedSearch }),
    ...(roleFilter        && { role: roleFilter }),
    ...(statusFilter      && { status_label: statusFilter }),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch, roleFilter, statusFilter],
    queryFn: () => adminService.getUsers(page, perPage, filters),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, label }) => adminService.updateUserStatus(userId, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const users = data?.data ?? [];
  const meta = data?.meta ?? {};
  const lastPage = meta.last_page ?? 1;
  const total = meta.total ?? 0;
  const from = meta.from ?? 0;
  const to = meta.to ?? 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage all registered Guests and Owners</p>
          </div>
          {!isLoading && !isError && (
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">{total} Users</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or NRC..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-300 transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={handleFilterChange(setRoleFilter)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-300 transition"
          >
            <option value="">All Roles</option>
            <option value="Guest">Guest</option>
            <option value="Owner">Owner</option>
          </select>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-gray-300 transition"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Blacklisted">Blacklisted</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg className="w-8 h-8 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-gray-400">Loading users...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-500 font-medium">
                {error?.response?.data?.message ?? 'Failed to load users.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">NRC Number</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                            {(page - 1) * perPage + idx + 1}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-700">
                                  {u.full_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-gray-600">{u.phone_number}</td>
                          <td className="px-5 py-3.5 font-mono text-gray-500 text-xs">{u.nrc_number}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLES[u.role]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                              {ROLES[u.role]?.label ?? u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_STYLES[u.status_label] ?? 'bg-gray-100 text-gray-500'
                            }`}>
                              {u.status_label ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <ActionMenu
                              userId={u.id}
                              currentStatus={u.status_label}
                              onAction={(userId, label) => statusMutation.mutate({ userId, label })}
                              isPending={statusMutation.isPending && statusMutation.variables?.userId === u.id}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {lastPage > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{from}–{to}</span> of{' '}
                    <span className="font-medium text-gray-700">{total}</span> users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-2">
                      {page} / {lastPage}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={page === lastPage}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
};

export default Dashboard;
