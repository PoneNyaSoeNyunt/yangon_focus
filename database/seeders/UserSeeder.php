<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $activeStatusId = DB::table('status_codes')
            ->where('context', 'User')
            ->where('label', 'Active')
            ->value('id');

        $usersToInsert = [];
        $rateLimitsToInsert = [];

        $superAdmin = [
            'phone_number'   => '09765432189',
            'full_name'      => 'Pone Nya',
            'nrc_number'     => '12(N)111111',
            'password_hash'  => Hash::make('$Admin123'),
            'role'           => 'Super Admin',
            'user_status_id' => $activeStatusId,
            'created_at'     => now(),
            'updated_at'     => now(),
        ];

        $usersToInsert[] = $superAdmin;
        $rateLimitsToInsert[] = [
            'phone_number'    => '09765432189',
            'failed_attempts' => 0,
            'lockout_level'   => 0,
            'unlock_at'       => null,
            'last_attempt_at' => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ];

        DB::table('users')->insert($usersToInsert);
        DB::table('auth_rate_limits')->insert($rateLimitsToInsert);
    }
}
