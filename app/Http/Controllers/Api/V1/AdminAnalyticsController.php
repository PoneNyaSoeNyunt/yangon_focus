<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AdminAnalyticsService;

class AdminAnalyticsController extends Controller
{
    public function __construct(protected AdminAnalyticsService $analyticsService) {}

    public function index()
    {
        return response()->json($this->analyticsService->getAnalytics());
    }

    public function finance()
    {
        return response()->json($this->analyticsService->getFinanceAnalytics());
    }
}
