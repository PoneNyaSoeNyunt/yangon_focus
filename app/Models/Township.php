<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Township extends Model
{
    protected $fillable = ['name'];

    public function hostels()
    {
        return $this->hasMany(Hostel::class, 'township_id');
    }
}
