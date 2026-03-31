<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformConfigSeeder extends Seeder
{
    public function run(): void
    {
        $configs = [
            ['key' => 'monthly_subscription_fee', 'value' => '5000'],
        ];

        foreach ($configs as $config) {
            DB::table('platform_configs')->updateOrInsert(
                ['key' => $config['key']],
                ['value' => $config['value'], 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}
