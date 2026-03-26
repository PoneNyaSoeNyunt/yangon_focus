<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'misconduct_reports';

    protected $fillable = [
        'reporter_id',
        'offender_id',
        'reason_category',
        'description',
        'evidence_url',
        'status',
        'admin_note',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function offender()
    {
        return $this->belongsTo(User::class, 'offender_id');
    }
}
