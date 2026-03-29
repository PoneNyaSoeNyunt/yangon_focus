<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Hostel;

class HostelPaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = ['hostel_id', 'method_name', 'account_number', 'account_name'];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
}
