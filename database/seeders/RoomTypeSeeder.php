<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roomTypes = [
            ['name' => 'Single', 'standard_capacity' => 1],
            ['name' => 'Two-Person', 'standard_capacity' => 2],
            ['name' => 'Hall', 'standard_capacity' => 12],
        ];

        DB::table('room_types')->insertOrIgnore($roomTypes);
    }
}
