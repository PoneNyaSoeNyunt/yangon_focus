<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\StatusCode;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredBookings extends Command
{
    protected $signature   = 'bookings:cancel-expired';
    protected $description = 'Cancel pending bookings older than 24 hours with no verified payment';

    public function handle(): void
    {
        $pendingId = StatusCode::where('context', 'Booking')
            ->where('label', 'Pending')->value('id');

        $cancelledId = StatusCode::where('context', 'Booking')
            ->where('label', 'Cancelled')->value('id');

        $verifiedPaymentId = StatusCode::where('context', 'Payment')
            ->where('label', 'Verified')->value('id');

        $expired = Booking::where('booking_status_id', $pendingId)
            ->where('created_at', '<', now()->subHours(24))
            ->whereDoesntHave('payments', fn($q) => $q->where('payment_status_id', $verifiedPaymentId))
            ->with('bed')
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired bookings found.');
            return;
        }

        DB::transaction(function () use ($expired, $cancelledId) {
            foreach ($expired as $booking) {
                $booking->update(['booking_status_id' => $cancelledId]);
                $booking->bed->update(['is_occupied' => false]);
            }
        });

        $this->info("Cancelled {$expired->count()} expired booking(s).");
    }
}
