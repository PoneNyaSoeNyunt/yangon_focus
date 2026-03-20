<?php

namespace App\Services;

use App\Models\User;
use App\Models\StatusCode;
use Illuminate\Pagination\LengthAwarePaginator;

class SuperAdminService
{
    public function getPaginatedUsers(int $perPage = 15): LengthAwarePaginator
    {
        return User::with('statusCode')
            ->whereIn('role', ['Guest', 'Owner'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function updateUserStatus(int $userId, string $label): User
    {
        $statusCode = StatusCode::where('label', $label)
            ->where('context', 'User')
            ->firstOrFail();

        $user = User::findOrFail($userId);
        $user->user_status_id = $statusCode->id;
        $user->save();

        return $user->load('statusCode');
    }
}
