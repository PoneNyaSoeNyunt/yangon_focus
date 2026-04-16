<?php

namespace App\Services;

use App\Models\User;
use App\Models\Hostel;
use App\Models\StatusCode;
use App\Models\BusinessLicense;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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

        if ($label === 'Blacklisted') {
            $user->tokens()->delete();
        }

        return $user->load('statusCode');
    }

    public function getLicenses(array $filters = []): LengthAwarePaginator
    {
        $query = BusinessLicense::with(['hostel.owner', 'hostel.listingStatus', 'status'])
            ->orderBy('submitted_at', 'desc');

        if (!empty($filters['status_label'])) {
            if ($filters['status_label'] === 'Disabled') {
                $query->whereHas('hostel.listingStatus', fn($q) =>
                    $q->where('label', 'Disabled')
                );
            } else {
                $query->whereHas('status', fn($q) =>
                    $q->where('label', $filters['status_label'])
                )->whereHas('hostel.listingStatus', fn($q) =>
                    $q->where('label', '!=', 'Disabled')
                );
            }
        }

        return $query->paginate(15);
    }

    public function updateLicenseStatus(int $id, string $label, ?string $reason = null): BusinessLicense
    {
        $statusCode = StatusCode::where('label', $label)
            ->where('context', 'License')
            ->firstOrFail();

        $license = BusinessLicense::findOrFail($id);
        $license->status_id        = $statusCode->id;
        $license->verified_at      = $label === 'Verified' ? now() : null;
        $license->rejection_reason = $label === 'Rejected' ? $reason : null;
        $license->save();

        if ($label === 'Verified') {
            $publishedStatus = StatusCode::where('context', 'Hostel')
                ->where('label', 'Published')
                ->firstOrFail();
            $license->hostel()->update(['listing_status_id' => $publishedStatus->id, 'disable_reason' => null]);
        }

        return $license->load(['hostel.owner', 'status']);
    }

    public function disableHostel(int $licenseId, string $reason): BusinessLicense
    {
        $license = BusinessLicense::findOrFail($licenseId);

        $disabledHostelStatus = StatusCode::where('context', 'Hostel')
            ->where('label', 'Disabled')
            ->firstOrFail();

        $license->hostel()->update([
            'listing_status_id' => $disabledHostelStatus->id,
            'disable_reason'    => $reason,
        ]);

        return $license->fresh(['hostel.owner', 'hostel.listingStatus', 'status']);
    }

    public function undoDisable(int $licenseId): BusinessLicense
    {
        $license = BusinessLicense::findOrFail($licenseId);

        $publishedHostelStatus = StatusCode::where('context', 'Hostel')
            ->where('label', 'Published')
            ->firstOrFail();

        $license->hostel()->update([
            'listing_status_id' => $publishedHostelStatus->id,
            'disable_reason'    => null,
        ]);

        return $license->fresh(['hostel.owner', 'hostel.listingStatus', 'status']);
    }
}
