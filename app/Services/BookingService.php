<?php

namespace App\Services;

use App\Models\Bed;
use App\Models\Booking;
use App\Models\StatusCode;
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
}
