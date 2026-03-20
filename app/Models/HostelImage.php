<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HostelImage extends Model
{
    public $timestamps = false;

    protected $fillable = ['hostel_id', 'image_url', 'is_primary', 'uploaded_at'];

    protected $casts = ['uploaded_at' => 'datetime', 'is_primary' => 'boolean'];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class, 'hostel_id');
    }
}
