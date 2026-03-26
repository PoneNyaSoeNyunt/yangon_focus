<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Services\ReviewService;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function index(int $hostelId)
    {
        return response()->json($this->reviewService->getHostelReviews($hostelId));
    }

    public function store(ReviewRequest $request, int $bookingId)
    {
        $review = $this->reviewService->submitReview(
            $request->user()->id,
            $bookingId,
            $request->validated()
        );

        return response()->json(['message' => 'Review submitted.', 'review' => $review], 201);
    }
}
