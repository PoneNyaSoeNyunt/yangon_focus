<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\StatusCode;

class CurrentStayService
{
    public function getCurrentStay(int $guestId): ?array
    {
        $activeIds = StatusCode::where('context', 'Booking')
            ->whereIn('label', ['Active', 'Confirmed'])
            ->pluck('id');

        $booking = Booking::with([
            'status',
            'bed.room.type',
            'bed.room.hostel.township',
            'payments' => fn($q) => $q->latest()->limit(1),
            'payments.status',
        ])
        ->where('guest_id', $guestId)
        ->whereIn('booking_status_id', $activeIds)
        ->latest()
        ->first();

        if (!$booking) {
            return null;
        }

        $nextPaymentDue = $booking->check_in_date
            ?->copy()
            ->addMonths((int) $booking->stay_duration)
            ->toDateString();

        $hostel = $booking->bed?->room?->hostel;
        $room   = $booking->bed?->room;

        return [
            'id'               => $booking->id,
            'status'           => $booking->status?->label,
            'check_in_date'    => $booking->check_in_date?->toDateString(),
            'stay_duration'    => $booking->stay_duration,
            'locked_price'     => $booking->locked_price,
            'next_payment_due' => $nextPaymentDue,
            'bed'              => [
                'id'         => $booking->bed?->id,
                'bed_number' => $booking->bed?->bed_number,
            ],
            'room'  => [
                'id'        => $room?->id,
                'label'     => $room?->label,
                'type'      => $room?->type?->name,
            ],
            'hostel' => [
                'id'       => $hostel?->id,
                'name'     => $hostel?->name,
                'type'     => $hostel?->type,
                'address'  => $hostel?->address,
                'township' => $hostel?->township?->name,
            ],
            'latest_payment' => $booking->payments->first()
                ? [
                    'id'     => $booking->payments->first()->id,
                    'type'   => $booking->payments->first()->type,
                    'status' => $booking->payments->first()->status?->label,
                ]
                : null,
        ];
    }
}
