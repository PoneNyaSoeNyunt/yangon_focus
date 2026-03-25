import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import publicService from '../services/publicService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const TYPE_STYLES = {
  'Male Only':   'bg-blue-100 text-blue-700',
  'Female Only': 'bg-pink-100 text-pink-700',
  'Mixed':       'bg-purple-100 text-purple-700',
};

const today = new Date().toISOString().split('T')[0];

/* ── Bed Button ────────────────────────────────────── */
const BedButton = ({ bed, isSelected, onSelect }) => (
  <button
    type="button"
    disabled={bed.is_occupied}
    onClick={() => !bed.is_occupied && onSelect(bed)}
    title={bed.is_occupied ? 'Unavailable' : `Bed ${bed.bed_number}`}
    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition text-xs font-medium w-16
      ${bed.is_occupied
        ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
        : isSelected
          ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-105'
          : 'bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:bg-teal-50 cursor-pointer'
      }`}
  >
    <svg className="w-6 h-5" viewBox="0 0 24 20" fill="currentColor">
      <rect x="1" y="10" width="22" height="8" rx="2" />
      <rect x="1" y="6" width="10" height="6" rx="1" />
      <rect x="13" y="6" width="10" height="6" rx="1" />
      <rect x="2" y="17" width="3" height="3" rx="0.5" />
      <rect x="19" y="17" width="3" height="3" rx="0.5" />
    </svg>
    <span className="leading-none">{bed.is_occupied ? 'Taken' : `Bed ${bed.bed_number}`}</span>
  </button>
);

/* ── Room Section ──────────────────────────────────── */
const RoomBeds = ({ room, selectedBed, onSelectBed }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div>
        <h3 className="font-semibold text-gray-900">{room.label}</h3>
        <p className="text-xs text-gray-400">{room.type?.name}</p>
      </div>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="text-teal-600 font-bold">
          {Number(room.price_per_month).toLocaleString()} <span className="text-xs font-normal text-gray-400">MMK/mo</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
          ${room.available_beds > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
          {room.available_beds}/{room.beds.length} free
        </span>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {room.beds.map((bed) => (
        <BedButton
          key={bed.id}
          bed={bed}
          isSelected={selectedBed?.id === bed.id}
          onSelect={(b) => onSelectBed(b, room.price_per_month, room.label)}
        />
      ))}
    </div>
  </div>
);

/* ── Gallery ───────────────────────────────────────── */
const GallerySection = ({ images }) => {
  const [active, setActive] = useState(() => images.find((i) => i.is_primary) ?? images[0] ?? null);
  const others = images.filter((i) => i.id !== active?.id);

  if (!images.length) return null;

  return (
    <div className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <div className="relative w-full max-h-[60vh] overflow-hidden rounded-b-2xl">
          <img
            src={active?.image_url}
            alt="Primary"
            className="w-full max-h-[60vh] object-cover"
          />
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              {images.length} photos
            </span>
          )}
        </div>
        {others.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-thin">
            {others.slice(0, 12).map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(img)}
                className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-400 transition"
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Booking Sidebar ────────────────────────────────── */
const BookingSidebar = ({
  hostel, selectedBed, selectedRoomLabel, selectedRoomPrice,
  checkInDate, setCheckInDate, stayDuration, setStayDuration,
  onBook, isPending, error, success, isAuthenticated, userRole,
}) => {
  const total = selectedRoomPrice ? Number(selectedRoomPrice) * Number(stayDuration) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 sticky top-20">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Starting from</p>
      <p className="text-2xl font-extrabold text-teal-600 mb-4">
        {hostel.rooms_min_price_per_month
          ? `${Number(hostel.rooms_min_price_per_month).toLocaleString()} MMK`
          : 'Contact for price'}
        <span className="text-sm font-normal text-gray-400 ml-1">/mo</span>
      </p>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✓ Booking submitted! The owner will confirm shortly.
        </div>
      )}

      {selectedBed ? (
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm">
            <p className="text-xs text-teal-600 font-semibold mb-0.5">Selected</p>
            <p className="font-semibold text-gray-800">{selectedRoomLabel} — Bed {selectedBed.bed_number}</p>
            <p className="text-teal-700 font-bold">{Number(selectedRoomPrice).toLocaleString()} MMK/mo</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Check-in Date</label>
            <input
              type="date"
              min={today}
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stay Duration</label>
            <select
              value={stayDuration}
              onChange={(e) => setStayDuration(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {total !== null && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">{total.toLocaleString()} MMK</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="block text-center w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition"
            >
              Log in to Book
            </Link>
          ) : userRole !== 'Guest' ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-center">
              Only guests can place bookings.
            </p>
          ) : (
            <button
              type="button"
              disabled={!checkInDate || isPending}
              onClick={onBook}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Book Now
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          Select a bed below to proceed with booking.
        </p>
      )}
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────── */
const HostelDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedBed, setSelectedBed]           = useState(null);
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(null);
  const [selectedRoomLabel, setSelectedRoomLabel] = useState('');
  const [checkInDate, setCheckInDate]             = useState('');
  const [stayDuration, setStayDuration]           = useState(1);
  const [bookingError, setBookingError]           = useState('');
  const [bookingSuccess, setBookingSuccess]       = useState(false);

  const { data: hostel, isLoading, isError } = useQuery({
    queryKey: ['hostel', id],
    queryFn: () => publicService.getHostel(id),
  });

  const bookingMutation = useMutation({
    mutationFn: () => bookingService.create({ bed_id: selectedBed.id, check_in_date: checkInDate, stay_duration: stayDuration }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel', id] });
      setSelectedBed(null);
      setBookingSuccess(true);
      setBookingError('');
    },
    onError: (err) => setBookingError(err?.response?.data?.message ?? 'Booking failed. Please try again.'),
  });

  const handleSelectBed = (bed, roomPrice, roomLabel) => {
    setSelectedBed(bed);
    setSelectedRoomPrice(roomPrice);
    setSelectedRoomLabel(roomLabel);
    setBookingError('');
    setBookingSuccess(false);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <svg className="w-10 h-10 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <Footer />
    </div>
  );

  if (isError || !hostel) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-xl font-bold text-gray-700">Hostel not found</p>
        <p className="text-gray-400 text-sm">This listing may have been removed or is unavailable.</p>
        <Link to="/" className="px-5 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition">
          Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  );

  const images = hostel.images ?? [];
  const rooms  = hostel.rooms ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <GallerySection images={images} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Info ── */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {hostel.type && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[hostel.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {hostel.type}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {hostel.township?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{hostel.name}</h1>
              {hostel.address && <p className="text-sm text-gray-400 mt-1">{hostel.address}</p>}
            </div>

            {hostel.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">About this Hostel</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{hostel.description}</p>
              </div>
            )}

            {hostel.house_rules && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">House Rules</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{hostel.house_rules}</p>
              </div>
            )}
          </div>

          {/* ── Right: Booking sidebar ── */}
          <div>
            <BookingSidebar
              hostel={hostel}
              selectedBed={selectedBed}
              selectedRoomLabel={selectedRoomLabel}
              selectedRoomPrice={selectedRoomPrice}
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              stayDuration={stayDuration}
              setStayDuration={setStayDuration}
              onBook={() => bookingMutation.mutate()}
              isPending={bookingMutation.isPending}
              error={bookingError}
              success={bookingSuccess}
              isAuthenticated={isAuthenticated}
              userRole={user?.role}
            />
          </div>
        </div>

        {/* ── Rooms & Beds ── */}
        {rooms.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Rooms &amp; Beds
              <span className="ml-2 text-sm font-normal text-gray-400">
                — click a free bed to select it
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <RoomBeds
                  key={room.id}
                  room={room}
                  selectedBed={selectedBed}
                  onSelectBed={handleSelectBed}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HostelDetailPage;
