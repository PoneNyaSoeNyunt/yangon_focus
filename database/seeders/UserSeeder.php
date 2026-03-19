<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $pendingStatusId = DB::table('status_codes')
            ->where('context', 'User')
            ->where('label', 'Pending Verification')
            ->value('id');

        $usersToInsert = [];
        $rateLimitsToInsert = [];

        $superAdmin = [
            'phone_number'   => '09765432189',
            'full_name'      => 'Pone Nya',
            'nrc_number'     => '12(N)111111',
            'password_hash'  => Hash::make('admin'),
            'role'           => 'Super Admin',
            'user_status_id' => $pendingStatusId,
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

        $faker = Faker::create();
        $usedPhones = ['09765432189'];
        $usedNrcs = ['12(N)111111'];

        for ($i = 0; $i < 10; $i++) {
            do {
                $phone = '09' . $faker->numerify('#########');
            } while (in_array($phone, $usedPhones));
            $usedPhones[] = $phone;

            do {
                $nrc = $faker->numerify('##/######(N)######');
            } while (in_array($nrc, $usedNrcs));
            $usedNrcs[] = $nrc;

            $usersToInsert[] = [
                'phone_number'   => $phone,
                'full_name'      => $faker->name(),
                'nrc_number'     => $nrc,
                'password_hash'  => Hash::make('seeker'),
                'role'           => 'Guest',
                'user_status_id' => $pendingStatusId,
                'created_at'     => now(),
                'updated_at'     => now(),
            ];

            $rateLimitsToInsert[] = [
                'phone_number'    => $phone,
                'failed_attempts' => 0,
                'lockout_level'   => 0,
                'unlock_at'       => null,
                'last_attempt_at' => null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];
        }

        DB::table('users')->insert($usersToInsert);
        DB::table('auth_rate_limits')->insert($rateLimitsToInsert);
    }
}
