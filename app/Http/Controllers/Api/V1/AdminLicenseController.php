<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SuperAdminService;
use Illuminate\Http\Request;

class AdminLicenseController extends Controller
{
    public function __construct(protected SuperAdminService $superAdminService) {}

    public function index(Request $request)
    {
        $filters = $request->only(['status_label']);
        $paginated = $this->superAdminService->getLicenses($filters);

        return response()->json($paginated);
    }

    public function verify(Request $request, int $id)
    {
        $request->validate([
            'label'  => ['required', 'string', 'in:Verified,Rejected'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $license = $this->superAdminService->updateLicenseStatus(
            $id,
            $request->input('label'),
            $request->input('reason')
        );

        return response()->json([
            'message' => 'License status updated successfully.',
            'license' => $license,
        ]);
    }
}
