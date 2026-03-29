<?php

namespace Database\Seeders;

use App\Models\ReportCategory;
use Illuminate\Database\Seeder;

class ReportCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Unpaid Rent',        'target_role' => 'Guest'],
            ['name' => 'Property Damage',     'target_role' => 'Guest'],
            ['name' => 'Behavioral Issue',    'target_role' => 'Guest'],
            ['name' => 'Facility Issue',      'target_role' => 'Owner'],
            ['name' => 'Safety Concern',      'target_role' => 'Owner'],
            ['name' => 'Listing Inaccuracy',  'target_role' => 'Owner'],
        ];

        foreach ($categories as $cat) {
            ReportCategory::firstOrCreate(['name' => $cat['name']], $cat);
        }
    }
}
