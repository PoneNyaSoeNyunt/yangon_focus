<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}

    public function guestIndex(Request $request)
    {
        $bookings = $this->bookingService->getGuestBookings($request->user()->id);
        return BookingResource::collection($bookings);
    }

    public function guestCancel(Request $request, int $id)
    {
        try {
            $booking = $this->bookingService->cancelGuestBooking($request->user()->id, $id);
            return response()->json(['message' => 'Booking cancelled.', 'booking' => new BookingResource($booking)]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function guestPayCash(Request $request, int $id)
    {
        try {
            $this->bookingService->guestPayCash($request->user()->id, $id);
            return response()->json(['message' => 'Cash payment intent recorded. The owner has been notified.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function ownerIndex(Request $request)
    {
        $bookings = $this->bookingService->getOwnerBookings($request->user()->id);
        return response()->json($bookings);
    }

    public function ownerCancel(Request $request, int $id)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        try {
            $booking = $this->bookingService->ownerCancelBooking(
                $request->user()->id, $id, $request->reason
            );
            return response()->json(['message' => 'Booking cancelled.', 'booking' => $booking]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function guestFinish(Request $request, int $id)
    {
        try {
            $booking = $this->bookingService->finishStay($request->user()->id, $id);
            return response()->json(['message' => 'Stay finished. Bed has been vacated.', 'booking' => new BookingResource($booking)]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

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
