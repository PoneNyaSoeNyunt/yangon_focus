<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\StatusCode;

class CurrentStayService
{
    private function activeStatusIds(): \Illuminate\Support\Collection
    {
        return StatusCode::where('context', 'Booking')
            ->whereIn('label', ['Active', 'Confirmed'])
            ->pluck('id');
    }

    private function eagerLoads(): array
    {
        return [
            'status',
            'bed.room.type',
            'bed.room.hostel.township',
            'bed.room.hostel.owner',
            'payments' => fn($q) => $q->latest()->limit(1),
            'payments.status',
        ];
    }

    private function buildSummary(Booking $booking): array
    {
        $hostel = $booking->bed?->room?->hostel;

        return [
            'id'           => $booking->id,
            'status'       => $booking->status?->label,
            'locked_price' => $booking->locked_price,
            'check_in_date'=> $booking->check_in_date?->toDateString(),
            'bed_number'   => $booking->bed?->bed_number,
            'hostel'       => [
                'id'   => $hostel?->id,
                'name' => $hostel?->name,
                'type' => $hostel?->type,
            ],
        ];
    }

    private function buildDetail(Booking $booking): array
    {
        $hostel = $booking->bed?->room?->hostel;
        $room   = $booking->bed?->room;

        $nextPaymentDue = $booking->check_in_date
            ?->copy()
            ->addMonths((int) $booking->stay_duration)
            ->toDateString();

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
                'id'    => $room?->id,
                'label' => $room?->label,
                'type'  => $room?->type?->name,
            ],
            'hostel' => [
                'id'          => $hostel?->id,
                'name'        => $hostel?->name,
                'type'        => $hostel?->type,
                'address'     => $hostel?->address,
                'township'    => $hostel?->township?->name,
                'owner_phone' => $hostel?->owner?->phone_number,
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

    public function getCurrentStays(int $guestId): array
    {
        return Booking::with($this->eagerLoads())
            ->where('guest_id', $guestId)
            ->whereIn('booking_status_id', $this->activeStatusIds())
            ->latest()
            ->get()
            ->map(fn($b) => $this->buildSummary($b))
            ->values()
            ->all();
    }

    public function getStayDetail(int $guestId, int $bookingId): ?array
    {
        $booking = Booking::with($this->eagerLoads())
            ->where('guest_id', $guestId)
            ->whereIn('booking_status_id', $this->activeStatusIds())
            ->find($bookingId);

        return $booking ? $this->buildDetail($booking) : null;
    }
}
