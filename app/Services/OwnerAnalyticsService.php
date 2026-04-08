<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class OwnerAnalyticsService
{
    private const PAYMENT_VERIFIED_ID = 9;

    public function getRevenueSummary(int $ownerId): array
    {
        $base = fn () => DB::table('payments')
            ->join('hostels', 'payments.hostel_id', '=', 'hostels.id')
            ->where('hostels.owner_id', $ownerId)
            ->where('payments.payment_status_id', self::PAYMENT_VERIFIED_ID)
            ->whereNotNull('payments.hostel_id')
            ->whereNull('payments.subscription_id');

        $totalEarnings = $base()->sum('payments.total_amount');

        $cashRevenue = $base()
            ->where('payments.payment_method', 'Cash')
            ->sum('payments.total_amount');

        $since = now()->subMonths(5)->startOfMonth();

        $rows = $base()
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
            'monthly_trend'  => $monthlyTrend,
        ];
    }
}
