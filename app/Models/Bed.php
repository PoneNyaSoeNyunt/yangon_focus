<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bed extends Model
{
    protected $fillable = ['room_id', 'bed_number', 'is_occupied'];

    protected $casts = ['is_occupied' => 'boolean'];

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
