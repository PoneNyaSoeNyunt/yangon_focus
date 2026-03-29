<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\StatusCode;

class Report extends Model
{
    protected $table = 'misconduct_reports';

    protected $fillable = [
        'reporter_id',
        'offender_id',
        'category_id',
        'description',
        'evidence_url',
        'status_id',
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

    public function category()
    {
        return $this->belongsTo(ReportCategory::class, 'category_id');
    }

    public function statusCode()
    {
        return $this->belongsTo(StatusCode::class, 'status_id');
    }
}
