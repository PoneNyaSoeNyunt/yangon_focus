<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\RenterService;
use Illuminate\Http\Request;

class RenterController extends Controller
{
    public function __construct(private RenterService $renterService) {}

    public function index(Request $request)
    {
        $renters = $this->renterService->getOwnerRenters($request->user()->id);
        return response()->json($renters);
    }

    public function payments(Request $request, int $userId)
    {
        try {
            $payments = $this->renterService->getRenterPayments($request->user()->id, $userId);
            return response()->json($payments);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
