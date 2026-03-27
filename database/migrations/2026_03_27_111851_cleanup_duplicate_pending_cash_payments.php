<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $pendingReviewId = DB::table('status_codes')
            ->where('context', 'Payment')->where('label', 'Pending Review')->value('id');

        $verifiedId = DB::table('status_codes')
            ->where('context', 'Payment')->where('label', 'Verified')->value('id');

        if (!$pendingReviewId || !$verifiedId) {
            return;
        }

        $bookingsWithVerifiedCash = DB::table('payments')
            ->where('type', 'Cash')
            ->where('payment_status_id', $verifiedId)
            ->pluck('booking_id');

        DB::table('payments')
            ->where('type', 'Cash')
            ->where('payment_status_id', $pendingReviewId)
            ->whereIn('booking_id', $bookingsWithVerifiedCash)
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // irreversible data clean-up
    }
};
