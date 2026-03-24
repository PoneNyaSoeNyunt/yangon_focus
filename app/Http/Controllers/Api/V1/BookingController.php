<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}

    public function store(Request $request)
    {
        $data = $request->validate([
            'bed_id'        => ['required', 'integer', 'exists:beds,id'],
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'stay_duration' => ['required', 'integer', 'min:1', 'max:24'],
        ]);

        try {
            $booking = $this->bookingService->createBooking($request->user()->id, $data);
            return response()->json([
                'message' => 'Booking created successfully.',
                'booking' => $booking,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
