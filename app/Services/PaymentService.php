<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\StatusCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentService
{
    public function uploadDigitalPayment(int $guestId, int $bookingId, array $data): Payment
    {
        $booking = Booking::with('bed.room')
            ->where('guest_id', $guestId)
            ->findOrFail($bookingId);

        $pendingId = StatusCode::where('context', 'Booking')
            ->where('label', 'Pending')->value('id');

        if ($booking->booking_status_id !== $pendingId) {
            throw new \Exception('Booking is not pending payment.');
        }

        $pendingReviewId = StatusCode::where('context', 'Payment')
            ->where('label', 'Pending Review')->firstOrFail()->id;

        $screenshotUrl = null;
        if (!empty($data['screenshot'])) {
            $path = $data['screenshot']->store('payment-screenshots', 'public');
            $screenshotUrl = Storage::url($path);
        }

        return Payment::create([
            'type'              => $data['type'],
            'booking_id'        => $bookingId,
            'hostel_id'         => $booking->bed->room->hostel_id,
            'screenshot_url'    => $screenshotUrl,
            'transaction_id'    => $data['transaction_id'] ?? null,
            'payment_status_id' => $pendingReviewId,
        ]);
    }

    public function recordCashPayment(int $ownerId, int $bookingId): Booking
    {
        return DB::transaction(function () use ($ownerId, $bookingId) {
            $booking = Booking::with('bed.room.hostel')
                ->lockForUpdate()
                ->findOrFail($bookingId);

            if ($booking->bed->room->hostel->owner_id !== $ownerId) {
                throw new \Exception('Unauthorized.');
            }

            $pendingId = StatusCode::where('context', 'Booking')
                ->where('label', 'Pending')->value('id');

            if ($booking->booking_status_id !== $pendingId) {
                throw new \Exception('Booking is not in Pending status.');
            }

            $confirmedId     = StatusCode::where('context', 'Booking')
                ->where('label', 'Confirmed')->firstOrFail()->id;
            $verifiedId      = StatusCode::where('context', 'Payment')
                ->where('label', 'Verified')->firstOrFail()->id;
            $pendingReviewId = StatusCode::where('context', 'Payment')
                ->where('label', 'Pending Review')->value('id');

            $pending = Payment::where('booking_id', $bookingId)
                ->where('type', 'Cash')
                ->where('payment_status_id', $pendingReviewId)
                ->first();

            if ($pending) {
                $pending->update(['payment_status_id' => $verifiedId]);
            } else {
                Payment::create([
                    'type'              => 'Cash',
                    'booking_id'        => $bookingId,
                    'hostel_id'         => $booking->bed->room->hostel_id,
                    'payment_status_id' => $verifiedId,
                ]);
            }

            $booking->update(['booking_status_id' => $confirmedId]);
            $booking->bed->update(['is_occupied' => true]);

            return $booking->fresh(['status', 'bed.room']);
        });
    }

    public function uploadAdvancePayment(int $guestId, int $bookingId, array $data): Payment
    {
        $booking = Booking::with('bed.room')
            ->where('guest_id', $guestId)
            ->findOrFail($bookingId);

        $activeIds = StatusCode::where('context', 'Booking')
            ->whereIn('label', ['Active', 'Confirmed'])
            ->pluck('id');

        if (!$activeIds->contains($booking->booking_status_id)) {
            throw new \Exception('Booking must be Active or Confirmed for advance payment.');
        }

        $pendingReviewId = StatusCode::where('context', 'Payment')
            ->where('label', 'Pending Review')->firstOrFail()->id;

        $screenshotUrl = null;
        if (!empty($data['screenshot'])) {
            $path = $data['screenshot']->store('payment-screenshots', 'public');
            $screenshotUrl = Storage::url($path);
        }

        return Payment::create([
            'type'              => 'Advance',
            'payment_method'    => $data['type'] ?? null,
            'total_amount'      => $booking->bed->room->price_per_month,
            'booking_id'        => $bookingId,
            'hostel_id'         => $booking->bed->room->hostel_id,
            'screenshot_url'    => $screenshotUrl,
            'transaction_id'    => $data['transaction_id'] ?? null,
            'payment_status_id' => $pendingReviewId,
        ]);
    }

    public function verifyDigitalPayment(int $ownerId, int $paymentId): Payment
    {
        return DB::transaction(function () use ($ownerId, $paymentId) {
            $payment = Payment::with('booking.bed.room.hostel')
                ->lockForUpdate()
                ->findOrFail($paymentId);

            if ($payment->booking->bed->room->hostel->owner_id !== $ownerId) {
                throw new \Exception('Unauthorized.');
            }

            $verifiedId = StatusCode::where('context', 'Payment')
                ->where('label', 'Verified')->firstOrFail()->id;

            $payment->update(['payment_status_id' => $verifiedId]);

            if ($payment->type === 'Advance') {
                $payment->booking->increment('stay_duration');
            } else {
                $confirmedId = StatusCode::where('context', 'Booking')
                    ->where('label', 'Confirmed')->firstOrFail()->id;
                $payment->booking->update(['booking_status_id' => $confirmedId]);
                $payment->booking->bed->update(['is_occupied' => true]);
            }

            return $payment->fresh(['status', 'booking.status']);
        });
    }

    public function getOwnerPendingDigitalPayments(int $ownerId): \Illuminate\Database\Eloquent\Collection
    {
        $pendingReviewId = StatusCode::where('context', 'Payment')
            ->where('label', 'Pending Review')->value('id');

        return Payment::with([
            'booking.guest',
            'booking.status',
            'booking.bed.room.hostel',
            'status',
        ])
        ->where('payment_status_id', $pendingReviewId)
        ->where('type', '!=', 'Cash')
        ->whereHas('booking.bed.room.hostel', fn($q) => $q->where('owner_id', $ownerId))
        ->orderBy('created_at', 'desc')
        ->get();
    }
}
