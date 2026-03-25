<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    public function guestUpload(Request $request, int $bookingId)
    {
        $data = $request->validate([
            'type'           => ['required', 'in:KBZPay,WaveMoney,Bank Transfer'],
            'screenshot'     => ['required', 'image', 'max:5120'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
        ]);
        $data['screenshot'] = $request->file('screenshot');

        try {
            $payment = $this->paymentService->uploadDigitalPayment($request->user()->id, $bookingId, $data);
            return response()->json(['message' => 'Payment submitted for review.', 'payment' => $payment], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function recordCash(Request $request, int $bookingId)
    {
        try {
            $booking = $this->paymentService->recordCashPayment($request->user()->id, $bookingId);
            return response()->json(['message' => 'Cash payment recorded. Booking confirmed.', 'booking' => $booking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function ownerPendingDigital(Request $request)
    {
        $payments = $this->paymentService->getOwnerPendingDigitalPayments($request->user()->id);
        return response()->json($payments);
    }

    public function verifyDigital(Request $request, int $paymentId)
    {
        try {
            $payment = $this->paymentService->verifyDigitalPayment($request->user()->id, $paymentId);
            return response()->json(['message' => 'Payment verified. Booking confirmed.', 'payment' => $payment]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
