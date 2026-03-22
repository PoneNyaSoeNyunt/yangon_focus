<?php

namespace App\Services;

use App\Models\BusinessLicense;
use App\Models\Hostel;
use App\Models\HostelImage;
use App\Models\Room;
use App\Models\Bed;
use App\Models\StatusCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HostelService
{
    public function createHostel(int $ownerId, array $data): Hostel
    {
        $draftStatus = StatusCode::where('context', 'Hostel')
            ->where('label', 'Draft')
            ->firstOrFail();

        return Hostel::create([
            'name'              => $data['name'],
            'description'       => $data['description'] ?? null,
            'address'           => $data['address'],
            'house_rules'       => $data['house_rules'] ?? null,
            'type'              => $data['type'],
            'owner_id'          => $ownerId,
            'township_id'       => $data['township_id'],
            'listing_status_id' => $draftStatus->id,
        ]);
    }

    public function addRooms(int $hostelId, array $rooms): array
    {
        $created = [];

        DB::transaction(function () use ($hostelId, $rooms, &$created) {
            foreach ($rooms as $roomData) {
                $room = Room::create([
                    'label'           => $roomData['label'],
                    'price_per_month' => $roomData['price_per_month'],
                    'max_occupancy'   => $roomData['max_occupancy'],
                    'hostel_id'       => $hostelId,
                    'type_id'         => $roomData['type_id'],
                ]);

                for ($i = 1; $i <= $roomData['max_occupancy']; $i++) {
                    Bed::create([
                        'room_id'     => $room->id,
                        'bed_number'  => $i,
                        'is_occupied' => false,
                    ]);
                }

                $created[] = $room->load('beds');
            }
        });

        return $created;
    }

    public function uploadLicense(int $hostelId, string $licenseNumber, UploadedFile $image): BusinessLicense
    {
        $pendingStatus = StatusCode::where('context', 'License')
            ->where('label', 'Pending Review')
            ->firstOrFail();

        $path = $image->store('licenses', 'public');
        $url  = Storage::url($path);

        return BusinessLicense::create([
            'hostel_id'      => $hostelId,
            'license_number' => $licenseNumber,
            'image_url'      => $url,
            'submitted_at'   => now(),
            'status_id'      => $pendingStatus->id,
        ]);
    }

    public function uploadImages(int $hostelId, array $files): array
    {
        $created = [];
        $isPrimary = !HostelImage::where('hostel_id', $hostelId)->exists();

        foreach ($files as $file) {
            $path = $file->store("hostel-images/{$hostelId}", 'public');
            $url  = Storage::url($path);

            $created[] = HostelImage::create([
                'hostel_id'   => $hostelId,
                'image_url'   => $url,
                'is_primary'  => $isPrimary,
                'uploaded_at' => now(),
            ]);

            $isPrimary = false;
        }

        return $created;
    }

    public function searchHostels(array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $publishedId = StatusCode::where('context', 'Hostel')
            ->where('label', 'Published')
            ->value('id');

        $query = Hostel::with(['township:id,name', 'primaryImage:id,hostel_id,image_url,is_primary'])
            ->withMin('rooms', 'price_per_month')
            ->where('listing_status_id', $publishedId);

        if (!empty($filters['township_id'])) {
            $query->where('township_id', (int) $filters['township_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
            $query->whereHas('rooms', function ($q) use ($filters) {
                if (!empty($filters['min_price'])) {
                    $q->where('price_per_month', '>=', (int) $filters['min_price']);
                }
                if (!empty($filters['max_price'])) {
                    $q->where('price_per_month', '<=', (int) $filters['max_price']);
                }
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getOwnerHostels(int $ownerId)
    {
        return Hostel::with(['township', 'listingStatus', 'rooms'])
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getHostel(int $ownerId, int $hostelId): Hostel
    {
        return Hostel::with(['township', 'listingStatus', 'rooms.beds', 'rooms.type', 'businessLicenses.status', 'images'])
            ->where('owner_id', $ownerId)
            ->findOrFail($hostelId);
    }

    public function makeImagePrimary(int $hostelId, int $imageId): void
    {
        HostelImage::where('hostel_id', $hostelId)->update(['is_primary' => false]);
        HostelImage::where('id', $imageId)->where('hostel_id', $hostelId)->update(['is_primary' => true]);
    }

    public function deleteImage(int $imageId): void
    {
        $image = HostelImage::findOrFail($imageId);
        $path  = ltrim(str_replace('/storage', 'public', $image->image_url), '/');
        Storage::delete($path);
        $image->delete();
    }

    public function updateHostel(int $hostelId, array $data): Hostel
    {
        $hostel = Hostel::findOrFail($hostelId);
        $hostel->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'address'     => $data['address'],
            'house_rules' => $data['house_rules'] ?? null,
            'type'        => $data['type'],
            'township_id' => $data['township_id'],
        ]);

        return $hostel->load(['township', 'listingStatus']);
    }
}
