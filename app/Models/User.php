<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'phone_number',
        'full_name',
        'nrc_region',
        'nrc_township_id',
        'nrc_type',
        'nrc_number',
        'password_hash',
        'role',
        'user_status_id',
        'subscription_until',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at'         => 'datetime',
            'updated_at'         => 'datetime',
            'subscription_until' => 'datetime',
        ];
    }

    public function statusCode()
    {
        return $this->belongsTo(StatusCode::class, 'user_status_id');
    }

    public function nrcTownship()
    {
        return $this->belongsTo(NrcTownship::class, 'nrc_township_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'owner_id');
    }

    public function hostels()
    {
        return $this->hasMany(Hostel::class, 'owner_id');
    }

    /**
     * Normalize a phone number to the 09XXXXXXXX Myanmar format.
     * Handles +959, 959, and 09 prefixes, and strips spaces/dashes.
     */
    public static function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[\s\-]/', '', $phone);

        if (str_starts_with($phone, '+959')) {
            return '09' . substr($phone, 4);
        }

        if (str_starts_with($phone, '959')) {
            return '09' . substr($phone, 3);
        }

        return $phone;
    }
}
