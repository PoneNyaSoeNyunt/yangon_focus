<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OwnerAnalyticsService;
use Illuminate\Http\Request;

class OwnerAnalyticsController extends Controller
{
    public function __construct(protected OwnerAnalyticsService $analyticsService) {}

    public function revenue(Request $request)
    {
        $summary = $this->analyticsService->getRevenueSummary($request->user()->id);

        return response()->json($summary);
    }
}
