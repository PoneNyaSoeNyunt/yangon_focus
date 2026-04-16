<?php

namespace Database\Seeders;

use App\Models\StatusCode;
use Illuminate\Database\Seeder;

class StatusCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['id' => 1,  'context' => 'User',    'label' => 'Active'],
            ['id' => 2,  'context' => 'User',    'label' => 'Suspended'],
            ['id' => 3,  'context' => 'User',    'label' => 'Blacklisted'],

            ['id' => 4,  'context' => 'Booking', 'label' => 'Pending'],
            ['id' => 5,  'context' => 'Booking', 'label' => 'Confirmed'],
            ['id' => 6,  'context' => 'Booking', 'label' => 'Cancelled'],
            ['id' => 7,  'context' => 'Booking', 'label' => 'Completed'],

            ['id' => 8,  'context' => 'Payment', 'label' => 'Pending Review'],
            ['id' => 9,  'context' => 'Payment', 'label' => 'Verified'],
            ['id' => 10, 'context' => 'Payment', 'label' => 'Rejected'],

            ['id' => 11, 'context' => 'Hostel',  'label' => 'Draft'],
            ['id' => 12, 'context' => 'Hostel',  'label' => 'Published'],
            ['id' => 13, 'context' => 'Hostel',  'label' => 'Disabled'],

            ['id' => 14, 'context' => 'Report',  'label' => 'Open'],
            ['id' => 15, 'context' => 'Report',  'label' => 'Investigating'],
            ['id' => 16, 'context' => 'Report',  'label' => 'Action Taken'],
            ['id' => 17, 'context' => 'Report',  'label' => 'Dismissed'],

            ['id' => 18, 'context' => 'License', 'label' => 'Pending Review'],
            ['id' => 19, 'context' => 'License', 'label' => 'Verified'],
            ['id' => 20, 'context' => 'License', 'label' => 'Rejected'],
            ['id' => 26, 'context' => 'License', 'label' => 'Disabled'],

            ['id' => 21, 'context' => 'Comment',      'label' => 'Open'],
            ['id' => 22, 'context' => 'Comment',      'label' => 'Resolved'],

            ['id' => 23, 'context' => 'Subscription', 'label' => 'Active'],
            ['id' => 24, 'context' => 'Subscription', 'label' => 'Overdue'],
            ['id' => 25, 'context' => 'Subscription', 'label' => 'Pending Verification'],
        ];

        foreach ($statuses as $status) {
            StatusCode::updateOrCreate(
                ['id' => $status['id']],
                ['context' => $status['context'], 'label' => $status['label']]
            );
        }
    }
}
