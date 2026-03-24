<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'guest_id', 'bed_id', 'check_in_date',
        'stay_duration', 'locked_price', 'booking_status_id',
    ];

    protected $casts = ['check_in_date' => 'date'];

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
}
