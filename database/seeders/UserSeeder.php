<?php

namespace Database\Seeders;

use App\Models\User;
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

        // Resolve township IDs from the seeded nrc_townships table
        $dagana = DB::table('nrc_townships')
            ->where('region_code', 12)->where('township_code', 'DAGANA')->value('id');
        $tamana = DB::table('nrc_townships')
            ->where('region_code', 12)->where('township_code', 'TAMANA')->value('id');

        // Super Admin
        User::updateOrCreate(
            ['phone_number' => '09765432189'],
            [
                'full_name'       => 'Pone Nya',
                'nrc_region'      => 12,
                'nrc_township_id' => $dagana,
                'nrc_type'        => 'N',
                'nrc_number'      => '111111',
                'password_hash'   => Hash::make('$Admin123'),
                'role'            => 'Super Admin',
                'user_status_id'  => $activeStatusId,
            ]
        );

        DB::table('auth_rate_limits')->updateOrInsert(
            ['phone_number' => '09765432189'],
            [
                'failed_attempts' => 0,
                'lockout_level'   => 0,
                'unlock_at'       => null,
                'last_attempt_at' => null,
                'updated_at'      => now(),
            ]
        );
    }
}
