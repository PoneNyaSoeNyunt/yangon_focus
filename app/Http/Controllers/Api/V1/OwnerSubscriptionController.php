<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class OwnerSubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $subscriptionService) {}

    public function show(Request $request)
    {
        return response()->json(
            $this->subscriptionService->getOwnerCurrentSubscription($request->user()->id)
        );
    }

    public function history(Request $request)
    {
        return response()->json(
            $this->subscriptionService->getOwnerPaymentHistory($request->user()->id)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'screenshot'               => ['required', 'image', 'max:5120'],
            'hostel_payment_method_id' => ['nullable', 'integer', 'exists:hostel_payment_methods,id'],
        ]);

        try {
            $payment = $this->subscriptionService->submitSubscriptionPayment(
                $request->user()->id,
                $request->input('hostel_payment_method_id'),
                $request->file('screenshot')
            );

            return response()->json([
                'message' => 'Subscription payment submitted for review.',
                'payment' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
