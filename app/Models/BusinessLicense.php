<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessLicense extends Model
{
    protected $fillable = [
        'hostel_id', 'license_number', 'image_url',
        'submitted_at', 'verified_at', 'rejection_reason', 'status_id',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'verified_at'  => 'datetime',
    ];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class, 'hostel_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusCode::class, 'status_id');
    }
}
