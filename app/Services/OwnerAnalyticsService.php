<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class OwnerAnalyticsService
{
    private const PAYMENT_VERIFIED_ID  = 9;
    private const BOOKING_PENDING_ID   = 4;

    public function getRevenueSummary(int $ownerId): array
    {
        $baseVerified = fn () => DB::table('payments')
            ->join('hostels', 'payments.hostel_id', '=', 'hostels.id')
            ->where('hostels.owner_id', $ownerId)
            ->where('payments.payment_status_id', self::PAYMENT_VERIFIED_ID)
            ->whereNotNull('payments.hostel_id')
            ->whereNull('payments.subscription_id');

        $totalEarnings = $baseVerified()->sum('payments.total_amount');

        $cashRevenue = $baseVerified()
            ->where('payments.payment_method', 'Cash')
            ->sum('payments.total_amount');

        $thisMonth = $baseVerified()
            ->whereRaw("DATE_FORMAT(payments.created_at, '%Y-%m') = ?", [now()->format('Y-m')])
            ->sum('payments.total_amount');

        $pendingAmount = DB::table('bookings')
            ->join('beds', 'bookings.bed_id', '=', 'beds.id')
            ->join('rooms', 'beds.room_id', '=', 'rooms.id')
            ->join('hostels', 'rooms.hostel_id', '=', 'hostels.id')
            ->where('hostels.owner_id', $ownerId)
            ->where('bookings.booking_status_id', self::BOOKING_PENDING_ID)
            ->sum(DB::raw('bookings.locked_price * bookings.stay_duration'));

        $since = now()->subMonths(5)->startOfMonth();

        $rows = $baseVerified()
            ->where('payments.created_at', '>=', $since)
            ->selectRaw("DATE_FORMAT(payments.created_at, '%Y-%m') as month, SUM(payments.total_amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $monthlyTrend[] = [
                'month' => $key,
                'label' => now()->subMonths($i)->format('M Y'),
                'total' => (float) ($rows->get($key)?->total ?? 0),
            ];
        }

        return [
            'total_earnings' => (float) $totalEarnings,
            'cash_revenue'   => (float) $cashRevenue,
            'this_month'     => (float) $thisMonth,
            'pending_amount' => (float) $pendingAmount,
            'monthly_trend'  => $monthlyTrend,
        ];
    }
}
