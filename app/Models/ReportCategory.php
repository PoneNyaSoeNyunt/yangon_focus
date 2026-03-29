<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportCategory extends Model
{
    protected $fillable = ['name', 'target_role'];

    public function reports()
    {
        return $this->hasMany(Report::class, 'category_id');
    }
}
