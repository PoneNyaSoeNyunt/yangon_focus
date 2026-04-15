<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\HostelPaymentMethod;
use App\Models\Payment;
use App\Models\StatusCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentService
{
    protected ImageService $images;

    public function __construct(ImageService $images)
    {
        $this->images = $images;
    }
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
            $screenshotUrl = $this->images->upload($data['screenshot'], 'payment-screenshots');
        }

        $method = HostelPaymentMethod::findOrFail($data['hostel_payment_method_id']);

        return Payment::create([
            'hostel_payment_method_id' => $method->id,
            'payment_method'           => $method->method_name,
            'total_amount'             => $booking->locked_price,
            'booking_id'               => $bookingId,
            'hostel_id'                => $booking->bed->room->hostel_id,
            'screenshot_url'           => $screenshotUrl,
            'payment_status_id'        => $pendingReviewId,
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
                ->where('payment_method', 'Cash')
                ->where('is_advance', false)
                ->where('payment_status_id', $pendingReviewId)
                ->first();

            if ($pending) {
                $pending->update(['payment_status_id' => $verifiedId]);
            } else {
                Payment::create([
                    'payment_method'    => 'Cash',
                    'total_amount'      => $booking->locked_price,
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
            $screenshotUrl = $this->images->upload($data['screenshot'], 'payment-screenshots');
        }

        $isCash     = empty($data['hostel_payment_method_id']);
        $methodName = $isCash
            ? 'Cash'
            : HostelPaymentMethod::findOrFail($data['hostel_payment_method_id'])->method_name;

        return Payment::create([
            'hostel_payment_method_id' => $isCash ? null : $data['hostel_payment_method_id'],
            'payment_method'           => $methodName,
            'total_amount'             => $booking->bed->room->price_per_month,
            'is_advance'               => true,
            'booking_id'               => $bookingId,
            'hostel_id'                => $booking->bed->room->hostel_id,
            'screenshot_url'           => $screenshotUrl,
            'payment_status_id'        => $pendingReviewId,
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

            if ($payment->is_advance) {
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

    public function rejectDigitalPayment(int $ownerId, int $paymentId, ?string $reason = null): Payment
    {
        return DB::transaction(function () use ($ownerId, $paymentId, $reason) {
            $payment = Payment::with('booking.bed.room.hostel')
                ->lockForUpdate()
                ->findOrFail($paymentId);

            if ($payment->booking->bed->room->hostel->owner_id !== $ownerId) {
                throw new \Exception('Unauthorized.');
            }

            $rejectedId = StatusCode::where('context', 'Payment')
                ->where('label', 'Rejected')->firstOrFail()->id;

            $payment->update([
                'payment_status_id' => $rejectedId,
                'rejection_reason'  => $reason,
            ]);

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
            'paymentMethod',
            'status',
        ])
        ->where('payment_status_id', $pendingReviewId)
        ->where(function ($q) {
            $q->whereNotNull('hostel_payment_method_id')
              ->orWhere(fn($q2) => $q2->where('is_advance', true)->where('payment_method', 'Cash'));
        })
        ->whereHas('booking.bed.room.hostel', fn($q) => $q->where('owner_id', $ownerId))
        ->orderBy('created_at', 'desc')
        ->get();
    }
}
