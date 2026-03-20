<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusCode extends Model
{
    protected $fillable = ['label', 'context'];

    public function users()
    {
        return $this->hasMany(User::class, 'user_status_id');
    }
}
