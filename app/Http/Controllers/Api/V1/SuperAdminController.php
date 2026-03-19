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
}
