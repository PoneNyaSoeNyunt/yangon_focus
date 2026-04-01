<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformPaymentMethod extends Model
{
    protected $fillable = [
        'method_name',
        'account_number',
        'account_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
