<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'payment_method', 'total_amount', 'hostel_payment_method_id', 'is_advance',
        'booking_id', 'hostel_id', 'screenshot_url', 'payment_status_id',
    ];

    protected $casts = ['is_advance' => 'boolean'];

    public function paymentMethod()
    {
        return $this->belongsTo(HostelPaymentMethod::class, 'hostel_payment_method_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusCode::class, 'payment_status_id');
    }
}
