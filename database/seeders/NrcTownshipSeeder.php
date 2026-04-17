<?php

namespace Database\Seeders;

use App\Models\NrcTownship;
use Illuminate\Database\Seeder;

class NrcTownshipSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/nrc_data.json');

        if (!file_exists($path)) {
            $this->command?->warn("NRC data file not found at {$path} — skipping seeder.");
            return;
        }

        $rows = json_decode(file_get_contents($path), true) ?? [];

        foreach ($rows as $row) {
            if (empty($row['state_code']) || empty($row['township_code_en'])) {
                continue;
            }

            NrcTownship::updateOrCreate(
                [
                    'region_code'   => (int) $row['state_code'],
                    'township_code' => $row['township_code_en'],
                ],
                [
                    'township_en' => $row['township_en']   ?? '',
                    'township_mm' => $row['township_mm']   ?? '',
                ],
            );
        }
    }
}
