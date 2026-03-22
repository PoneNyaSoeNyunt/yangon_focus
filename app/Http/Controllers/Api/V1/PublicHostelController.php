<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HostelService;
use Illuminate\Http\Request;

class PublicHostelController extends Controller
{
    public function __construct(private HostelService $hostelService) {}

    public function index(Request $request)
    {
        $filters = $request->only(['township_id', 'type', 'min_price', 'max_price']);
        $hostels = $this->hostelService->searchHostels($filters);
        return response()->json($hostels);
    }
}
