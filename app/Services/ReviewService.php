<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function submitReview(int $guestId, int $bookingId, array $data): Review
    {
        $booking = Booking::with('bed.room.hostel', 'status')
            ->where('id', $bookingId)
            ->where('guest_id', $guestId)
            ->firstOrFail();

        abort_if($booking->status->label !== 'Completed', 403, 'You can only review completed bookings.');
        abort_if($booking->review()->exists(), 422, 'You have already reviewed this booking.');

        $hostelId = $booking->bed->room->hostel->id;

        return DB::transaction(function () use ($booking, $guestId, $hostelId, $data) {
            return Review::create([
                'booking_id'      => $booking->id,
                'guest_id'        => $guestId,
                'hostel_id'       => $hostelId,
                'rating'          => $data['rating'],
                'service_quality' => $data['service_quality'],
                'hygiene_score'   => $data['hygiene_score'],
                'comment'         => $data['comment'],
            ]);
        });
    }

    public function getHostelReviews(int $hostelId): array
    {
        $reviews = Review::with('guest:id,full_name')
            ->where('hostel_id', $hostelId)
            ->latest()
            ->get();

        $avg_rating          = round($reviews->avg('rating'), 1);
        $avg_service_quality = round($reviews->avg('service_quality'), 1);
        $avg_hygiene_score   = round($reviews->avg('hygiene_score'), 1);
        $total               = $reviews->count();

        return [
            'total'               => $total,
            'avg_rating'          => $avg_rating,
            'avg_service_quality' => $avg_service_quality,
            'avg_hygiene_score'   => $avg_hygiene_score,
            'reviews'             => $reviews->map(fn($r) => [
                'id'              => $r->id,
                'guest_id'        => $r->guest_id,
                'guest_name'      => $r->guest->full_name,
                'rating'          => $r->rating,
                'service_quality' => $r->service_quality,
                'hygiene_score'   => $r->hygiene_score,
                'comment'         => $r->comment,
                'created_at'      => $r->created_at->toDateString(),
            ])->values(),
        ];
    }

    public function updateReview(int $guestId, int $reviewId, array $data): Review
    {
        $review = Review::where('id', $reviewId)
            ->where('guest_id', $guestId)
            ->firstOrFail();

        $review->update([
            'rating'          => $data['rating'],
            'service_quality' => $data['service_quality'],
            'hygiene_score'   => $data['hygiene_score'],
            'comment'         => $data['comment'],
        ]);

        return $review->fresh();
    }

    public function deleteReview(int $guestId, int $reviewId): void
    {
        $review = Review::where('id', $reviewId)
            ->where('guest_id', $guestId)
            ->firstOrFail();

        $review->delete();
    }

    public function getReviewEligibility(int $guestId, int $hostelId): array
    {
        $completedBooking = Booking::with('status')
            ->where('guest_id', $guestId)
            ->whereHas('bed.room', fn($q) => $q->where('hostel_id', $hostelId))
            ->whereHas('status', fn($q) => $q->where('label', 'Completed'))
            ->whereDoesntHave('review')
            ->first();

        return [
            'can_review' => !!$completedBooking,
            'booking_id' => $completedBooking?->id,
        ];
    }
}
