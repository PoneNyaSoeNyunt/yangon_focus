<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'type', 'payment_method', 'booking_id', 'hostel_id',
        'screenshot_url', 'transaction_id', 'payment_status_id',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusCode::class, 'payment_status_id');
    }
}
