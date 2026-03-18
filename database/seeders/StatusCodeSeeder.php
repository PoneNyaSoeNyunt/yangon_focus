<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statusCodes = [
            ['label' => 'Active', 'context' => 'User'],
            ['label' => 'Suspended', 'context' => 'User'],
            ['label' => 'Blacklisted', 'context' => 'User'],
            ['label' => 'Pending Verification', 'context' => 'User'],

            ['label' => 'Pending', 'context' => 'Booking'],
            ['label' => 'Confirmed', 'context' => 'Booking'],
            ['label' => 'Cancelled', 'context' => 'Booking'],
            ['label' => 'Completed', 'context' => 'Booking'],

            ['label' => 'Pending Review', 'context' => 'Payment'],
            ['label' => 'Verified', 'context' => 'Payment'],
            ['label' => 'Rejected', 'context' => 'Payment'],

            ['label' => 'Draft', 'context' => 'Hostel'],
            ['label' => 'Published', 'context' => 'Hostel'],
            ['label' => 'Disabled', 'context' => 'Hostel'],

            ['label' => 'Open', 'context' => 'Report'],
            ['label' => 'Investigating', 'context' => 'Report'],
            ['label' => 'Action Taken', 'context' => 'Report'],
            ['label' => 'Dismissed', 'context' => 'Report'],

            ['label' => 'Pending Review', 'context' => 'License'],
            ['label' => 'Verified', 'context' => 'License'],
            ['label' => 'Rejected', 'context' => 'License'],
        ];

        DB::table('status_codes')->insert($statusCodes);
    }
}
