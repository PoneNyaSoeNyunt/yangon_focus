<?php

namespace App\Services;

use App\Models\User;
use App\Models\StatusCode;
use Illuminate\Pagination\LengthAwarePaginator;

class SuperAdminService
{
    public function getPaginatedUsers(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = User::with('statusCode')
            ->whereIn('role', ['Guest', 'Owner']);

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['status_label'])) {
            $query->whereHas('statusCode', fn($q) =>
                $q->where('label', $filters['status_label'])
            );
        }

        if (!empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(fn($q) =>
                $q->where('full_name', 'like', $term)
                  ->orWhere('phone_number', 'like', $term)
                  ->orWhere('nrc_number', 'like', $term)
            );
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
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
