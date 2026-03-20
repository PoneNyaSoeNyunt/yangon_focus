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
}
