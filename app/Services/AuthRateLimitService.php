<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthRateLimitService
{
    public function recordFailedAttempt(string $phoneNumber): void
    {
        $rateLimit = DB::table('auth_rate_limits')
            ->where('phone_number', $phoneNumber)
            ->first();

        if (!$rateLimit) {
            DB::table('auth_rate_limits')->insert([
                'phone_number' => $phoneNumber,
                'failed_attempts' => 1,
                'lockout_level' => 0,
                'unlock_at' => null,
                'last_attempt_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return;
        }

        $newAttempts = $rateLimit->failed_attempts + 1;
        $newLockoutLevel = $rateLimit->lockout_level;
        $unlockAt = $rateLimit->unlock_at;

        if ($newAttempts == 5) {
            $newLockoutLevel = 1;
            $unlockAt = now()->addMinutes(3);
        } elseif ($newAttempts == 10) {
            $newLockoutLevel = 2;
            $unlockAt = now()->addMinutes(10);
        } elseif ($newAttempts == 15) {
            $newLockoutLevel = 3;
            $unlockAt = now()->addMinutes(30);
        } elseif ($newAttempts == 20) {
            $newLockoutLevel = 4;
            $unlockAt = now()->addHours(24);
        }

        DB::table('auth_rate_limits')
            ->where('phone_number', $phoneNumber)
            ->update([
                'failed_attempts' => $newAttempts,
                'lockout_level' => $newLockoutLevel,
                'unlock_at' => $unlockAt,
                'last_attempt_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function isLockedOut(string $phoneNumber): array
    {
        $rateLimit = DB::table('auth_rate_limits')
            ->where('phone_number', $phoneNumber)
            ->first();

        if (!$rateLimit || !$rateLimit->unlock_at) {
            return ['locked' => false, 'remaining_minutes' => 0];
        }

        $unlockAt = Carbon::parse($rateLimit->unlock_at);
        
        if (now()->lt($unlockAt)) {
            $remainingMinutes = now()->diffInMinutes($unlockAt, true);
            return ['locked' => true, 'remaining_minutes' => ceil($remainingMinutes)];
        }

        return ['locked' => false, 'remaining_minutes' => 0];
    }

    public function resetAttempts(string $phoneNumber): void
    {
        DB::table('auth_rate_limits')
            ->where('phone_number', $phoneNumber)
            ->update([
                'failed_attempts' => 0,
                'lockout_level' => 0,
                'unlock_at' => null,
                'updated_at' => now(),
            ]);
    }
}
