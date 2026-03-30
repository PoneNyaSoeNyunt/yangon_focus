<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;

class OwnerManagementController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index()
    {
        return response()->json($this->subscriptionService->getAllOwners());
    }

    public function hostelDetails(int $id)
    {
        return response()->json($this->subscriptionService->getOwnerHostelDetails($id));
    }

    public function subscriptionHistory(int $id)
    {
        return response()->json($this->subscriptionService->getOwnerSubscriptionHistory($id));
    }

    public function verifySubscription(int $id)
    {
        try {
            $subscription = $this->subscriptionService->verifyOwnerSubscription($id);
            return response()->json([
                'message'      => 'Subscription verified and activated.',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
