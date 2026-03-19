<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class SuperAdminService
{
    public function getPaginatedUsers(int $perPage = 15): LengthAwarePaginator
    {
        return DB::table('users')
            ->whereIn('role', ['Guest', 'Owner'])
            ->select('id', 'phone_number', 'full_name', 'nrc_number', 'role', 'user_status_id', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
