<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['label', 'price_per_month', 'max_occupancy', 'hostel_id', 'type_id'];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class, 'hostel_id');
    }

    public function type()
    {
        return $this->belongsTo(RoomType::class, 'type_id');
    }

    public function beds()
    {
        return $this->hasMany(Bed::class, 'room_id');
    }
}
