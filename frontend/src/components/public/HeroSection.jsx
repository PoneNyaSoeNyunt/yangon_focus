import { Link } from 'react-router-dom';

const HeroSection = ({ onFindHostels }) => (
  <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 overflow-hidden">
    <div className="absolute inset-0 opacity-10"
      style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-600/40 text-teal-200 text-xs font-semibold mb-5">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Verified Hostels Across Yangon
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
          Find Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
            Hostel in Yangon
          </span>
        </h1>

        <p className="text-lg text-teal-100/80 mb-8 max-w-xl">
          Affordable, licensed, and verified hostels for students, workers, and travelers.
          Search by location, type, and budget — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onFindHostels}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-800 font-semibold rounded-xl hover:bg-teal-50 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find a Hostel
          </button>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700/60 border border-teal-500/40 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            List Your Property
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
