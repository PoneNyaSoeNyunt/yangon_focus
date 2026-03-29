import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from '../components/public/Navbar';
import HeroSection from '../components/public/HeroSection';
import SearchBar from '../components/public/SearchBar';
import HostelCard from '../components/public/HostelCard';
import Footer from '../components/public/Footer';
import publicService from '../services/publicService';
import UseDebounce from '../hooks/UseDebounce';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
      <div className="h-3 bg-gray-100 rounded w-full mt-4" />
    </div>
  </div>
);

const EmptyState = ({ hasFilters }) => (
  <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 9.5L12 4l9 5.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      </svg>
    </div>
    <div>
      <p className="font-semibold text-gray-700">No hostels found</p>
      <p className="text-sm text-gray-400 mt-1">
        {hasFilters ? 'Try adjusting your filters.' : 'No published listings yet.'}
      </p>
    </div>
  </div>
);

const ContactUsSection = () => {
  const { isAuthenticated, user } = useAuth();
  const isEligible = isAuthenticated && user?.role !== 'Admin';

  const [subject, setSubject]       = useState('');
  const [message, setMessage]       = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors]         = useState({});

  const mutation = useMutation({
    mutationFn: () => apiClient.post('/comments', { subject, message }),
    onSuccess: () => {
      setSubject('');
      setMessage('');
      setErrors({});
      setShowSuccess(true);
    },
    onError: (err) => setErrors(err?.response?.data?.errors ?? { general: ['Something went wrong. Please try again.'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate();
  };

  return (
    <section id="contact-us" className="bg-white border-t border-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-sm text-gray-500 mt-2">
            Have a question or issue? Send us a message and we'll get back to you.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Sign in to send a message</p>
            <p className="text-xs text-gray-400">You must be logged in as a guest or owner to contact support.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-gray-200 p-8 space-y-5">
            {errors.general && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {errors.general[0]}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={255}
                placeholder="e.g. Payment issue, Hostel question…"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white ${
                  errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                maxLength={2000}
                placeholder="Describe your question or issue in detail…"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none ${
                  errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.message
                  ? <p className="text-xs text-red-500">{errors.message[0]}</p>
                  : <span />}
                <span className="text-xs text-gray-400">{message.length}/2000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
            >
              {mutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </>
              ) : 'Send Message'}
            </button>
          </form>
        )}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your inquiry has been received. Our team will review it and get back to you shortly.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const resultsRef = useRef(null);
  const [filters, setFilters] = useState({});
  const debouncedFilters = UseDebounce(filters, 350);

  const { data: townships = [] } = useQuery({
    queryKey: ['public-townships'],
    queryFn: publicService.getTownships,
    staleTime: Infinity,
  });

  const activeParams = Object.fromEntries(
    Object.entries(debouncedFilters).filter(([, v]) => v !== undefined && v !== '')
  );

  const { data: hostels = [], isLoading, isFetching } = useQuery({
    queryKey: ['public-hostels', activeParams],
    queryFn: () => publicService.getHostels(activeParams),
    staleTime: 60_000,
    keepPreviousData: true,
  });

  const hasFilters = Object.keys(activeParams).length > 0;

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <HeroSection onFindHostels={scrollToResults} />

      <main className="flex-1">
        <div ref={resultsRef} id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <SearchBar filters={filters} onChange={setFilters} townships={townships} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {hasFilters ? 'Search Results' : 'All Hostels'}
              </h2>
              {!isLoading && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {hostels.length} hostel{hostels.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 animate-spin text-teal-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating…
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : hostels.length === 0
                ? <EmptyState hasFilters={hasFilters} />
                : hostels.map((h) => <HostelCard key={h.id} hostel={h} />)
            }
          </div>
        </div>
      </main>

      <ContactUsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
