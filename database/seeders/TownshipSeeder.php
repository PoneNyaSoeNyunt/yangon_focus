<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TownshipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $townships = [
            ['name' => 'Ahlon'],
            ['name' => 'Bahan'],
            ['name' => 'Botataung'],
            ['name' => 'Cocokyun'],
            ['name' => 'Dagon'],
            ['name' => 'Dagon Seikkan'],
            ['name' => 'Dala'],
            ['name' => 'Dawbon'],
            ['name' => 'East Dagon'],
            ['name' => 'Hlaing'],
            ['name' => 'Hlaingthaya East'],
            ['name' => 'Hlaingthaya West'],
            ['name' => 'Hlegu'],
            ['name' => 'Hmawbi'],
            ['name' => 'Htantabin'],
            ['name' => 'Insein'],
            ['name' => 'Kamayut'],
            ['name' => 'Kawhmu'],
            ['name' => 'Kayan'],
            ['name' => 'Kungyangon'],
            ['name' => 'Kyauktada'],
            ['name' => 'Kyauktan'],
            ['name' => 'Kyimyindaing'],
            ['name' => 'Lanmadaw'],
            ['name' => 'Latha'],
            ['name' => 'Mayangon'],
            ['name' => 'Mingala Taungnyunt'],
            ['name' => 'Mingaladon'],
            ['name' => 'North Dagon'],
            ['name' => 'North Okkalapa'],
            ['name' => 'Pabedan'],
            ['name' => 'Pazundaung'],
            ['name' => 'Sanchaung'],
            ['name' => 'Seikkyi Kanaungto'],
            ['name' => 'Shwepyitha'],
            ['name' => 'South Dagon'],
            ['name' => 'South Okkalapa'],
            ['name' => 'Taikkyi'],
            ['name' => 'Tamwe'],
            ['name' => 'Thaketa'],
            ['name' => 'Thanlyin'],
            ['name' => 'Thingangyun'],
            ['name' => 'Thongwa'],
            ['name' => 'Twante'],
            ['name' => 'Yankin'],
        ];

        DB::table('townships')->insert($townships);
    }
}
