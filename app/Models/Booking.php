<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'guest_id', 'bed_id', 'check_in_date',
        'stay_duration', 'locked_price', 'booking_status_id',
    ];

    protected $appends = ['expires_at'];

    protected $casts = ['check_in_date' => 'date'];

    protected function expiresAt(): Attribute
    {
        return Attribute::get(
            fn() => $this->created_at?->addHours(24)->toIso8601String()
        );
    }

    public function guest()
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class, 'bed_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusCode::class, 'booking_status_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id');
    }
}
