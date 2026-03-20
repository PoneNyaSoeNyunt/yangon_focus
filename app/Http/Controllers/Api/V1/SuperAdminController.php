<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\SuperAdminService;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    public function __construct(protected SuperAdminService $superAdminService) {}

    public function users(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        $paginated = $this->superAdminService->getPaginatedUsers($perPage);

        return UserResource::collection($paginated);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'label' => ['required', 'string', 'in:Active,Suspended,Blacklisted,Pending Verification'],
        ]);

        $user = $this->superAdminService->updateUserStatus($id, $request->input('label'));

        return response()->json([
            'message' => 'User status updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }
}
