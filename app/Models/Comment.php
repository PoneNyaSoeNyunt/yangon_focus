<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['user_id', 'subject', 'message', 'status_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function statusCode()
    {
        return $this->belongsTo(StatusCode::class, 'status_id');
    }
}
