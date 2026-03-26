<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CurrentStayService;
use Illuminate\Http\Request;

class CurrentStayController extends Controller
{
    public function __construct(private CurrentStayService $service) {}

    public function index(Request $request)
    {
        $stays = $this->service->getCurrentStays($request->user()->id);
        return response()->json(['data' => $stays]);
    }

    public function show(Request $request, int $booking_id)
    {
        $stay = $this->service->getStayDetail($request->user()->id, $booking_id);

        if (!$stay) {
            return response()->json(['data' => null, 'message' => 'Stay not found.'], 404);
        }

        return response()->json(['data' => $stay]);
    }
}
