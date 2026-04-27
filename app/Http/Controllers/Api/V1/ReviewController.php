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

    public function ownerIndex(Request $request)
    {
        $reviews = \App\Models\Review::with(['guest:id,full_name', 'hostel:id,name'])
            ->whereHas('hostel', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($r) => [
                'id'              => $r->id,
                'guest_name'      => $r->guest?->full_name,
                'hostel_name'     => $r->hostel?->name,
                'rating'          => $r->rating,
                'hygiene_score'   => $r->hygiene_score,
                'service_quality' => $r->service_quality,
                'comment'         => $r->comment,
                'created_at'      => $r->created_at,
            ]);

        $avg = fn ($field) => $reviews->whereNotNull($field)->avg($field);

        return response()->json([
            'summary' => [
                'avg_rating'          => round((float) $avg('rating'), 1),
                'avg_hygiene'         => round((float) $avg('hygiene_score'), 1),
                'avg_service_quality' => round((float) $avg('service_quality'), 1),
                'total'               => $reviews->count(),
            ],
            'reviews' => $reviews->values(),
        ]);
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

    public function update(ReviewRequest $request, int $id)
    {
        $review = $this->reviewService->updateReview(
            $request->user()->id,
            $id,
            $request->validated()
        );

        return response()->json(['message' => 'Review updated.', 'review' => $review]);
    }

    public function destroy(Request $request, int $id)
    {
        $this->reviewService->deleteReview($request->user()->id, $id);

        return response()->json(['message' => 'Review deleted.']);
    }

    public function eligibility(Request $request, int $hostelId)
    {
        return response()->json(
            $this->reviewService->getReviewEligibility($request->user()->id, $hostelId)
        );
    }
}
