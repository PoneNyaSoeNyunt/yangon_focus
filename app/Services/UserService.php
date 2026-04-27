<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function createUser(array $data): object
    {
        $data['phone_number'] = User::normalizePhoneNumber($data['phone_number']);

        $activeStatusId = DB::table('status_codes')
            ->where('context', 'User')
            ->where('label', 'Active')
            ->value('id');

        $userId = DB::table('users')->insertGetId([
            'phone_number'   => $data['phone_number'],
            'full_name'      => $data['full_name'],
            'nrc_region'     => $data['nrc_region'],
            'nrc_township_id'=> $data['nrc_township_id'],
            'nrc_type'       => $data['nrc_type'],
            'nrc_number'     => $data['nrc_number'],
            'password_hash'  => Hash::make($data['password']),
            'role'           => $data['role'],
            'user_status_id' => $activeStatusId,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('auth_rate_limits')->updateOrInsert(
            ['phone_number' => $data['phone_number']],
            [
                'failed_attempts' => 0,
                'lockout_level'   => 0,
                'unlock_at'       => null,
                'last_attempt_at' => null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]
        );

        return DB::table('users')->where('id', $userId)->first();
    }
}
