<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Models\Township;

class LookupController extends Controller
{
    public function townships()
    {
        return response()->json(Township::orderBy('name')->get(['id', 'name']));
    }

    public function roomTypes()
    {
        return response()->json(RoomType::orderBy('name')->get(['id', 'name', 'standard_capacity']));
    }
}
