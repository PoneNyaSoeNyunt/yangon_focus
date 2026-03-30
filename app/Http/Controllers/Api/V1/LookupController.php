<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Models\Township;
use Illuminate\Support\Facades\DB;

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

    public function contactInfo()
    {
        $admin = DB::table('users')
            ->where('role', 'Super Admin')
            ->first(['full_name', 'phone_number']);

        return response()->json([
            'phone_number' => $admin?->phone_number ?? null,
            'full_name'    => $admin?->full_name    ?? null,
        ]);
    }
}
