<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hostel extends Model
{
    protected $fillable = ['name', 'description', 'address', 'house_rules', 'type', 'owner_id', 'township_id', 'listing_status_id'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function businessLicenses()
    {
        return $this->hasMany(BusinessLicense::class, 'hostel_id');
    }
}
