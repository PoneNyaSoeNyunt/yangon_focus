<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CurrentStayService;
use Illuminate\Http\Request;

class CurrentStayController extends Controller
{
    public function __construct(private CurrentStayService $service) {}

    public function show(Request $request)
    {
        $stay = $this->service->getCurrentStay($request->user()->id);

        if (!$stay) {
            return response()->json(['data' => null, 'message' => 'No active stay found.'], 200);
        }

        return response()->json(['data' => $stay]);
    }
}
