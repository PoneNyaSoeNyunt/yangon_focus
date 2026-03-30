<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class SubscriptionConfigController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function index()
    {
        return response()->json([
            'key'   => 'monthly_subscription_fee',
            'value' => $this->subscriptionService->getSubscriptionFee(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'value' => ['required', 'numeric', 'min:0'],
        ]);

        $this->subscriptionService->updateSubscriptionFee((string) $request->input('value'));

        return response()->json([
            'message' => 'Subscription fee updated successfully.',
            'value'   => $request->input('value'),
        ]);
    }
}
