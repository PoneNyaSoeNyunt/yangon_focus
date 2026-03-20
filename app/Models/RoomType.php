<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    protected $fillable = ['name', 'standard_capacity'];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'type_id');
    }
}
