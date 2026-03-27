<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\StatusCode;
use Carbon\Carbon;

class RenterService
{
    public function getOwnerRenters(int $ownerId): array
    {
        $activeStatusIds = StatusCode::where('context', 'Booking')
            ->whereIn('label', ['Confirmed', 'Active'])
            ->pluck('id');

        $bookings = Booking::with([
            'guest',
            'bed.room',
            'status',
            'payments',
        ])
        ->whereIn('booking_status_id', $activeStatusIds)
        ->whereHas('bed.room.hostel', fn($q) => $q->where('owner_id', $ownerId))
        ->orderBy('check_in_date')
        ->get();

        $verifiedId = StatusCode::where('context', 'Payment')
            ->where('label', 'Verified')->value('id');

        return $bookings->map(function (Booking $booking) use ($verifiedId) {
            $verifiedAdvanceCount = $booking->payments
                ->where('type', 'Advance')
                ->where('payment_status_id', $verifiedId)
                ->count();

            $nextDue = Carbon::parse($booking->check_in_date)
                ->addMonths($booking->stay_duration)
                ->toDateString();

            return [
                'booking_id'       => $booking->id,
                'guest_id'         => $booking->guest_id,
                'full_name'        => $booking->guest->full_name,
                'phone_number'     => $booking->guest->phone_number,
                'nrc_number'       => $booking->guest->nrc_number,
                'room_label'       => $booking->bed->room->label,
                'bed_number'       => $booking->bed->bed_number,
                'check_in_date'    => $booking->check_in_date->toDateString(),
                'stay_duration'    => $booking->stay_duration,
                'locked_price'     => (float) $booking->locked_price,
                'next_payment_due' => $nextDue,
                'booking_status'   => $booking->status->label,
            ];
        })->toArray();
    }

    public function getRenterPayments(int $ownerId, int $userId): array
    {
        $verifiedId = StatusCode::where('context', 'Payment')
            ->where('label', 'Verified')->value('id');

        $bookings = Booking::with([
            'payments.status',
            'bed.room',
        ])
        ->where('guest_id', $userId)
        ->whereHas('bed.room.hostel', fn($q) => $q->where('owner_id', $ownerId))
        ->get();

        $result = [];

        foreach ($bookings as $booking) {
            $verifiedAdvanceCount = $booking->payments
                ->where('type', 'Advance')
                ->where('payment_status_id', $verifiedId)
                ->count();

            $originalDuration = max(1, $booking->stay_duration - $verifiedAdvanceCount);

            $sortedPayments = $booking->payments->sortBy('created_at')->values();
            $firstNonAdvanceSeen = false;

            foreach ($sortedPayments as $payment) {
                $isAdvance = $payment->type === 'Advance';

                if (!$isAdvance && !$firstNonAdvanceSeen) {
                    $amount = $booking->locked_price * $originalDuration;
                    $firstNonAdvanceSeen = true;
                } else {
                    $amount = $booking->locked_price;
                }

                $result[] = [
                    'payment_id'     => $payment->id,
                    'type'           => $payment->type,
                    'payment_method' => $payment->payment_method,
                    'amount'         => (float) $amount,
                    'status'         => $payment->status->label ?? 'Unknown',
                    'is_advance'     => $isAdvance,
                    'screenshot_url' => $payment->screenshot_url,
                    'transaction_id' => $payment->transaction_id,
                    'paid_at'        => $payment->created_at->toDateString(),
                    'room_label'     => $booking->bed->room->label,
                    'bed_number'     => $booking->bed->bed_number,
                    'locked_price'   => (float) $booking->locked_price,
                    'booking_id'     => $booking->id,
                ];
            }
        }

        usort($result, fn($a, $b) => strcmp($a['paid_at'], $b['paid_at']));

        return $result;
    }
}
