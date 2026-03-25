<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hostel;
use App\Models\StatusCode;
use App\Services\HostelService;
use Illuminate\Http\Request;

class PublicHostelController extends Controller
{
    public function __construct(private HostelService $hostelService) {}

    public function index(Request $request)
    {
        $filters = $request->only(['name', 'township_id', 'type', 'min_price', 'max_price']);
        $hostels = $this->hostelService->searchHostels($filters);
        return response()->json($hostels);
    }

    public function show(int $id)
    {
        $publishedId = StatusCode::where('context', 'Hostel')
            ->where('label', 'Published')
            ->value('id');

        $hostel = Hostel::with([
            'township',
            'images',
            'rooms' => function ($q) {
                $q->with(['type', 'beds'])
                  ->withCount(['beds as available_beds' => fn($q) => $q->where('is_occupied', false)]);
            },
        ])->where('listing_status_id', $publishedId)->findOrFail($id);

        return response()->json($hostel);
    }
}
