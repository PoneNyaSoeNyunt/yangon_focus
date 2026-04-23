import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import publicService from '../services/publicService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const TYPE_STYLES = {
  'Male Only':   'bg-blue-100 text-blue-700',
  'Female Only': 'bg-pink-100 text-pink-700',
  'Mixed':       'bg-purple-100 text-purple-700',
};

const FACILITY_ICONS = {
  'WiFi':         'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
  'Aircon':       'M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M1 12h1m18 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z',
  'CCTV':         'M15 10l4.553-2.07A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'Kitchen':      'M3 6h18M3 12h18M3 18h18',
  'Generator':    'M13 10V3L4 14h7v7l9-11h-7z',
};

const FacilitiesSection = ({ facilities }) => {
  if (!facilities?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Facilities</h2>
      <div className="flex flex-wrap gap-2">
        {facilities.map((f) => (
          <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={FACILITY_ICONS[f] ?? 'M12 4v16m8-8H4'} />
            </svg>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
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

/* ── Star Display ──────────────────────────────────── */
const StarDisplay = ({ value, max = 5, size = 'sm' }) => {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`${cls} ${i < value ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

/* ── Score Bar ─────────────────────────────────────── */
const ScoreBar = ({ label, value, max = 5 }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-28 text-gray-500 flex-shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <span className="w-8 text-right font-semibold text-gray-700">{value ?? '—'}</span>
  </div>
);

/* ── Star Picker ──────────────────────────────────── */
const StarPicker = ({ value, onChange }) => (
  <span className="inline-flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <svg className={`w-6 h-6 ${n <= value ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </span>
);

/* ── Review Form (write / edit) ───────────────────── */
const ReviewForm = ({ bookingId, editReview, hostelId, onDone }) => {
  const queryClient = useQueryClient();
  const isEdit = !!editReview;
  const [form, setForm] = useState({
    rating:          editReview?.rating ?? 0,
    service_quality: editReview?.service_quality ?? 0,
    hygiene_score:   editReview?.hygiene_score ?? 0,
    comment:         editReview?.comment ?? '',
  });
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => isEdit
      ? reviewService.updateReview(editReview.id, form)
      : reviewService.submitReview(bookingId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-reviews', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      setError('');
      if (onDone) onDone();
    },
    onError: (err) => setError(err?.response?.data?.message ?? 'Submission failed.'),
  });

  const canSubmit = form.rating > 0 && form.service_quality > 0 && form.hygiene_score > 0 && form.comment.trim();

  return (
    <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">{isEdit ? 'Edit Your Review' : 'Write a Review'}</h3>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Overall Rating</label>
        <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Service Quality</label>
          <StarPicker value={form.service_quality} onChange={(v) => setForm((f) => ({ ...f, service_quality: v }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Hygiene</label>
          <StarPicker value={form.hygiene_score} onChange={(v) => setForm((f) => ({ ...f, hygiene_score: v }))} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Comment <span className="text-red-400">*</span></label>
        <textarea
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience…"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-0.5">{form.comment.length}/1000</p>
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        {isEdit && (
          <button onClick={onDone} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        )}
        <button
          disabled={!canSubmit || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
          className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
        >
          {submitMutation.isPending ? 'Submitting…' : isEdit ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

/* ── Reviews Section ───────────────────────────────── */
const ReviewsSection = ({ hostelId, userId }) => {
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['hostel-reviews', hostelId],
    queryFn: () => reviewService.getHostelReviews(hostelId),
    enabled: !!hostelId,
  });

  const { data: eligibility } = useQuery({
    queryKey: ['review-eligibility', hostelId],
    queryFn: () => reviewService.getReviewEligibility(hostelId),
    enabled: !!hostelId && !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-reviews', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      setDeleteConfirm(null);
    },
  });

  if (isLoading) return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
      <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
    </div>
  );

  const total   = data?.total ?? 0;
  const reviews = data?.reviews ?? [];
  const canReview = eligibility?.can_review && !showForm && !editingReview;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Reviews
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">— {total} {total === 1 ? 'review' : 'reviews'}</span>}
        </h2>
        {canReview && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition"
          >
            Write Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ReviewForm
            bookingId={eligibility.booking_id}
            hostelId={hostelId}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}

      {total === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-3">
            <p className="text-5xl font-extrabold text-gray-900">{data.avg_rating}</p>
            <StarDisplay value={Math.round(data.avg_rating)} size="lg" />
            <p className="text-xs text-gray-400">{total} {total === 1 ? 'review' : 'reviews'}</p>
            <div className="w-full mt-2 space-y-2">
              <ScoreBar label="Service Quality" value={data.avg_service_quality} />
              <ScoreBar label="Hygiene" value={data.avg_hygiene_score} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {reviews.map((r) => (
              <div key={r.id}>
                {editingReview?.id === r.id ? (
                  <ReviewForm
                    editReview={r}
                    hostelId={hostelId}
                    onDone={() => setEditingReview(null)}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-teal-700">{r.guest_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{r.guest_name}</p>
                          <p className="text-xs text-gray-400">{r.created_at}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarDisplay value={r.rating} />
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span>Service: <span className="font-semibold text-gray-600">{r.service_quality}/5</span></span>
                          <span>Hygiene: <span className="font-semibold text-gray-600">{r.hygiene_score}/5</span></span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    {userId && r.guest_id === userId && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setEditingReview(r)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
                        >
                          Edit
                        </button>
                        {deleteConfirm === r.id ? (
                          <span className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">Delete?</span>
                            <button
                              onClick={() => deleteMutation.mutate(r.id)}
                              disabled={deleteMutation.isPending}
                              className="font-semibold text-red-500 hover:text-red-600 transition"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Yes'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="font-semibold text-gray-500 hover:text-gray-600 transition">No</button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(r.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Booking Modal ────────────────────────────────── */
const BookingModal = ({
  bed, roomLabel, roomPrice,
  checkInDate, setCheckInDate, stayDuration, setStayDuration,
  onBook, onClose, isPending, error, success, isAuthenticated, userRole, isSuspended,
}) => {
  const total = Number(roomPrice) * Number(stayDuration);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Book a Bed</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800">Booking submitted!</p>
              <p className="text-sm text-gray-400">Please make your payment to the owner within <span className="font-semibold text-amber-500">24 hours</span> to secure your bed. Unpaid bookings may be cancelled.</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
                  Later
                </button>
                <button onClick={() => window.location.href = '/guest/bookings'} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition">
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm">
                <p className="text-xs text-teal-600 font-semibold mb-0.5">Selected</p>
                <p className="font-semibold text-gray-800">{roomLabel} — Bed {bed.bed_number}</p>
                <p className="text-teal-700 font-bold">{Number(roomPrice).toLocaleString()} MMK/mo</p>
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

              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{total.toLocaleString()} MMK</span>
              </div>

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
              ) : isSuspended ? (
                <div className="relative group">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 bg-gray-300 cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 opacity-60"
                  >
                    Book Now
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    Account suspended.
                  </span>
                </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────── */
const HostelDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const isSuspended = user?.user_status_id === 2;
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen]               = useState(false);
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
      setBookingSuccess(true);
      setBookingError('');
    },
    onError: (err) => setBookingError(err?.response?.data?.message ?? 'Booking failed. Please try again.'),
  });

  const handleSelectBed = (bed, roomPrice, roomLabel) => {
    setSelectedBed(bed);
    setSelectedRoomPrice(roomPrice);
    setSelectedRoomLabel(roomLabel);
    setCheckInDate('');
    setStayDuration(1);
    setBookingError('');
    setBookingSuccess(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBed(null);
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
        <div className="space-y-6">
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
              {hostel.rooms_min_price_per_month && (
                <span className="ml-auto text-teal-600 font-bold text-sm">
                  from {Number(hostel.rooms_min_price_per_month).toLocaleString()} MMK
                  <span className="text-gray-400 font-normal">/mo</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{hostel.name}</h1>
            {hostel.address && <p className="text-sm text-gray-400 mt-1">{hostel.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FacilitiesSection facilities={hostel.facilities} />
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

        {/* ── Reviews ── */}
        <ReviewsSection hostelId={hostel.id} userId={user?.id} />
      </main>

      <Footer />

      {modalOpen && selectedBed && (
        <BookingModal
          bed={selectedBed}
          roomLabel={selectedRoomLabel}
          roomPrice={selectedRoomPrice}
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          stayDuration={stayDuration}
          setStayDuration={setStayDuration}
          onBook={() => bookingMutation.mutate()}
          onClose={handleCloseModal}
          isPending={bookingMutation.isPending}
          error={bookingError}
          success={bookingSuccess}
          isAuthenticated={isAuthenticated}
          userRole={user?.role}
          isSuspended={isSuspended}
        />
      )}
    </div>
  );
};

export default HostelDetailPage;
