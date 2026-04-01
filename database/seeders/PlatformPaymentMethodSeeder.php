<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformPaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'method_name'    => 'KBZPay',
                'account_number' => '09123456789',
                'account_name'   => 'Yangon Focus',
                'is_active'      => true,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'method_name'    => 'WaveMoney',
                'account_number' => '09987654321',
                'account_name'   => 'Yangon Focus',
                'is_active'      => true,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ];

        foreach ($methods as $method) {
            DB::table('platform_payment_methods')->updateOrInsert(
                ['method_name' => $method['method_name']],
                $method
            );
        }
    }
}
