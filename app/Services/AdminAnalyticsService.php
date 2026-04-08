<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsService
{
    public function getAnalytics(): array
    {
        $totalGuests = User::where('role', 'Guest')->count();
        $totalOwners = User::where('role', 'Owner')->count();
        $totalUsers  = User::whereIn('role', ['Guest', 'Owner'])->count();

        $monthly = DB::table('users')
            ->whereIn('role', ['Guest', 'Owner'])
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $months[] = [
                'month' => now()->subMonths($i)->format('M Y'),
                'count' => $monthly->get($key)?->count ?? 0,
            ];
        }

        return [
            'total_guests' => $totalGuests,
            'total_owners' => $totalOwners,
            'total_users'  => $totalUsers,
            'monthly_registrations' => $months,
        ];
    }

    public function getFinanceAnalytics(): array
    {
        $verifiedId = 9;

        $totalRevenue = DB::table('payments')
            ->where('payment_status_id', $verifiedId)
            ->whereNotNull('subscription_id')
            ->sum('total_amount');

        $since = now()->subMonths(11)->startOfMonth();

        $rows = DB::table('payments')
            ->where('payment_status_id', $verifiedId)
            ->whereNotNull('subscription_id')
            ->where('created_at', '>=', $since)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlyTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $monthlyTrend[] = [
                'month' => $key,
                'label' => now()->subMonths($i)->format('M Y'),
                'total' => (float) ($rows->get($key)?->total ?? 0),
            ];
        }

        $activeSubscriptions = DB::table('subscriptions')
            ->where('end_date', '>', now())
            ->distinct()
            ->count('owner_id');

        return [
            'total_revenue'        => (float) $totalRevenue,
            'active_subscriptions' => $activeSubscriptions,
            'monthly_trend'        => $monthlyTrend,
        ];
    }
}
