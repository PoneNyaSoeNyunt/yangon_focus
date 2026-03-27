<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hostel extends Model
{
    protected $fillable = ['name', 'description', 'address', 'house_rules', 'facilities', 'type', 'owner_id', 'township_id', 'listing_status_id'];

    protected $casts = [
        'facilities' => 'array',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function township()
    {
        return $this->belongsTo(Township::class, 'township_id');
    }

    public function listingStatus()
    {
        return $this->belongsTo(StatusCode::class, 'listing_status_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'hostel_id');
    }

    public function businessLicenses()
    {
        return $this->hasMany(BusinessLicense::class, 'hostel_id');
    }

    public function images()
    {
        return $this->hasMany(HostelImage::class, 'hostel_id');
    }

    public function primaryImage()
    {
        return $this->hasOne(HostelImage::class, 'hostel_id')->where('is_primary', true);
    }
}
