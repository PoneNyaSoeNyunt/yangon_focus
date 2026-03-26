<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'booking_id', 'guest_id', 'hostel_id',
        'rating', 'service_quality', 'hygiene_score', 'comment',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function guest()
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
}
