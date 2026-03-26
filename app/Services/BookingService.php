<?php

namespace App\Services;

use App\Models\Bed;
use App\Models\Booking;
use App\Models\StatusCode;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function createBooking(int $guestId, array $data): Booking
    {
        return DB::transaction(function () use ($guestId, $data) {
            $bed = Bed::with('room')->lockForUpdate()->findOrFail($data['bed_id']);

            if ($bed->is_occupied) {
                throw new \Exception('This bed is no longer available.');
            }

            $pendingStatus = StatusCode::where('context', 'Booking')
                ->where('label', 'Pending')
                ->firstOrFail();

            $booking = Booking::create([
                'guest_id'          => $guestId,
                'bed_id'            => $bed->id,
                'check_in_date'     => $data['check_in_date'],
                'stay_duration'     => $data['stay_duration'],
                'locked_price'      => $bed->room->price_per_month,
                'booking_status_id' => $pendingStatus->id,
            ]);

            $bed->update(['is_occupied' => true]);

            return $booking->load(['bed.room', 'status']);
        });
    }

    public function cancelGuestBooking(int $guestId, int $bookingId): Booking
    {
        return DB::transaction(function () use ($guestId, $bookingId) {
            $booking = Booking::with('bed')
                ->where('guest_id', $guestId)
                ->lockForUpdate()
                ->findOrFail($bookingId);

            $pendingId = StatusCode::where('context', 'Booking')
                ->where('label', 'Pending')->value('id');

            if ($booking->booking_status_id !== $pendingId) {
                throw new \Exception('Only Pending bookings can be cancelled.');
            }

            $cancelledId = StatusCode::where('context', 'Booking')
                ->where('label', 'Cancelled')->firstOrFail()->id;

            $booking->update(['booking_status_id' => $cancelledId]);
            $booking->bed->update(['is_occupied' => false]);

            return $booking->fresh(['status', 'bed']);
        });
    }

    public function guestPayCash(int $guestId, int $bookingId): \App\Models\Payment
    {
        $booking = Booking::with('bed.room')
            ->where('guest_id', $guestId)
            ->findOrFail($bookingId);

        $pendingId = StatusCode::where('context', 'Booking')
            ->where('label', 'Pending')->value('id');

        if ($booking->booking_status_id !== $pendingId) {
            throw new \Exception('Booking is not in Pending status.');
        }

        $pendingReviewId = StatusCode::where('context', 'Payment')
            ->where('label', 'Pending Review')->firstOrFail()->id;

        return \App\Models\Payment::create([
            'type'              => 'Cash',
            'booking_id'        => $bookingId,
            'hostel_id'         => $booking->bed->room->hostel_id,
            'payment_status_id' => $pendingReviewId,
        ]);
    }

    public function finishStay(int $guestId, int $bookingId): Booking
    {
        return DB::transaction(function () use ($guestId, $bookingId) {
            $booking = Booking::with('bed')
                ->where('guest_id', $guestId)
                ->lockForUpdate()
                ->findOrFail($bookingId);

            $allowedIds = StatusCode::where('context', 'Booking')
                ->whereIn('label', ['Active', 'Confirmed'])
                ->pluck('id');

            if (!$allowedIds->contains($booking->booking_status_id)) {
                throw new \Exception('Only Active or Confirmed stays can be finished.');
            }

            $finishedId = StatusCode::where('context', 'Booking')
                ->where('label', 'Completed')
                ->firstOrFail()->id;

            $booking->update(['booking_status_id' => $finishedId]);
            $booking->bed->update(['is_occupied' => false]);

            return $booking->fresh(['status', 'bed']);
        });
    }

    public function getGuestBookings(int $guestId): Collection
    {
        return Booking::with([
            'status',
            'bed.room.hostel.township',
            'payments.status',
            'review',
        ])
        ->where('guest_id', $guestId)
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function getOwnerBookings(int $ownerId): Collection
    {
        return Booking::with([
            'status',
            'guest',
            'bed.room.hostel',
            'payments.status',
        ])
        ->whereHas('bed.room.hostel', fn($q) => $q->where('owner_id', $ownerId))
        ->orderBy('created_at', 'desc')
        ->get();
    }
}
