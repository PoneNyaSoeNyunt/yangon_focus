<?php

namespace Database\Factories;

use App\Models\NrcTownship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $township = NrcTownship::inRandomOrder()->first();

        return [
            'phone_number'    => '09' . fake()->unique()->numerify('#########'),
            'full_name'       => fake()->name(),
            'nrc_region'      => $township?->region_code ?? fake()->numberBetween(1, 14),
            'nrc_township_id' => $township?->id,
            'nrc_type'        => 'N',
            'nrc_number'      => fake()->unique()->numerify('######'),
            'password_hash'   => static::$password ??= Hash::make('password'),
            'role'            => 'guest',
            'user_status_id'  => 1,
        ];
    }
}
