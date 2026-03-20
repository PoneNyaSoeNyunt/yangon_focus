<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        $activeStatusId = DB::table('status_codes')
            ->where('context', 'User')
            ->where('label', 'Active')
            ->value('id');

        $exists = DB::table('users')
            ->where('phone_number', '092345610')
            ->exists();

        if ($exists) {
            $this->command->info('Daw Hla already exists — skipping.');
            return;
        }

        DB::table('users')->insert([
            'phone_number'   => '092345610',
            'full_name'      => 'Daw Hla',
            'nrc_number'     => '12(N)222222',
            'password_hash'  => Hash::make('owner'),
            'role'           => 'Owner',
            'user_status_id' => $activeStatusId,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('auth_rate_limits')->insert([
            'phone_number'    => '092345610',
            'failed_attempts' => 0,
            'lockout_level'   => 0,
            'unlock_at'       => null,
            'last_attempt_at' => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }
}
