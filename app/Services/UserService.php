<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function createUser(array $data): object
    {
        $pendingVerificationStatus = DB::table('status_codes')
            ->where('context', 'User')
            ->where('label', 'Pending Verification')
            ->first();

        $userId = DB::table('users')->insertGetId([
            'phone_number' => $data['phone_number'],
            'full_name' => $data['full_name'],
            'nrc_number' => $data['nrc_number'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'role' => $data['role'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('auth_rate_limits')->insert([
            'phone_number' => $data['phone_number'],
            'failed_attempts' => 0,
            'lockout_level' => 0,
            'unlock_at' => null,
            'last_attempt_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('users')->where('id', $userId)->first();
    }
}
