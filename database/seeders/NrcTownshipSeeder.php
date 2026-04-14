<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NrcTownshipSeeder extends Seeder
{
    public function run(): void
    {
        $townships = [
            // Region 1 (Kachin)
            ['region_code' => 1, 'township_code' => 'MAKANA'],
            ['region_code' => 1, 'township_code' => 'BAMANA'],
            ['region_code' => 1, 'township_code' => 'WASANA'],
            ['region_code' => 1, 'township_code' => 'PHAKANA'],
            ['region_code' => 1, 'township_code' => 'MAHKANA'],

            // Region 9 (Sagaing)
            ['region_code' => 9, 'township_code' => 'MAMATA'],
            ['region_code' => 9, 'township_code' => 'TAKANA'],
            ['region_code' => 9, 'township_code' => 'KALATA'],
            ['region_code' => 9, 'township_code' => 'KHAMATA'],
            ['region_code' => 9, 'township_code' => 'SAHSANA'],

            // Region 12 (Yangon)
            ['region_code' => 12, 'township_code' => 'DAGANA'],
            ['region_code' => 12, 'township_code' => 'TAMANA'],
            ['region_code' => 12, 'township_code' => 'OAKAMA'],
            ['region_code' => 12, 'township_code' => 'BAKAHA'],
            ['region_code' => 12, 'township_code' => 'LAKANA'],
            ['region_code' => 12, 'township_code' => 'THAGAKA'],
            ['region_code' => 12, 'township_code' => 'KAMATA'],
            ['region_code' => 12, 'township_code' => 'YAKANA'],
            ['region_code' => 12, 'township_code' => 'AHSANA'],
            ['region_code' => 12, 'township_code' => 'TAKHANA'],
        ];

        foreach ($townships as $township) {
            DB::table('nrc_townships')->updateOrInsert(
                ['region_code' => $township['region_code'], 'township_code' => $township['township_code']],
                $township
            );
        }
    }
}
