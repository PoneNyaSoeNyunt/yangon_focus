<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AddRoomsRequest;
use App\Http\Requests\Api\CreateHostelRequest;
use App\Http\Requests\Api\UploadImagesRequest;
use App\Http\Requests\Api\UploadLicenseRequest;
use App\Services\HostelService;
use Illuminate\Http\Request;

class OwnerHostelController extends Controller
{
    public function __construct(protected HostelService $hostelService) {}

    public function index(Request $request)
    {
        $hostels = $this->hostelService->getOwnerHostels($request->user()->id);
        return response()->json($hostels);
    }

    public function store(CreateHostelRequest $request)
    {
        $hostel = $this->hostelService->createHostel(
            $request->user()->id,
            $request->validated()
        );

        return response()->json([
            'message' => 'Hostel created successfully.',
            'hostel'  => $hostel->load(['township', 'listingStatus']),
        ], 201);
    }

    public function addRooms(AddRoomsRequest $request, int $id)
    {
        $rooms = $this->hostelService->addRooms($id, $request->validated()['rooms']);

        return response()->json([
            'message' => 'Rooms and beds created successfully.',
            'rooms'   => $rooms,
        ], 201);
    }

    public function uploadLicense(UploadLicenseRequest $request, int $id)
    {
        $license = $this->hostelService->uploadLicense(
            $id,
            $request->validated()['license_number'],
            $request->file('image')
        );

        return response()->json([
            'message' => 'Business license submitted successfully.',
            'license' => $license,
        ], 201);
    }

    public function uploadImages(UploadImagesRequest $request, int $id)
    {
        $images = $this->hostelService->uploadImages($id, $request->file('images'));

        return response()->json([
            'message' => 'Images uploaded successfully.',
            'images'  => $images,
        ], 201);
    }
}
