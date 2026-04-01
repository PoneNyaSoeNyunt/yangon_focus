<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            StatusCodeSeeder::class,
            TownshipSeeder::class,
            RoomTypeSeeder::class,
            PlatformConfigSeeder::class,
            PlatformPaymentMethodSeeder::class,
            UserSeeder::class,
            ReportCategorySeeder::class,
        ]);
    }
}
