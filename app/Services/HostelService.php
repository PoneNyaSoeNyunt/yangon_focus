<?php

namespace App\Services;

use App\Models\BusinessLicense;
use App\Models\Hostel;
use App\Models\HostelImage;
use App\Models\HostelPaymentMethod;
use App\Models\Room;
use App\Models\Bed;
use App\Models\StatusCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HostelService
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }
    public function createHostel(int $ownerId, array $data): Hostel
    {
        $draftStatus = StatusCode::where('context', 'Hostel')
            ->where('label', 'Draft')
            ->firstOrFail();

        $hostel = Hostel::create([
            'name'              => $data['name'],
            'description'       => $data['description'] ?? null,
            'address'           => $data['address'],
            'house_rules'       => $data['house_rules'] ?? null,
            'facilities'        => $data['facilities'] ?? [],
            'type'              => $data['type'],
            'owner_id'          => $ownerId,
            'township_id'       => $data['township_id'],
            'listing_status_id' => $draftStatus->id,
        ]);

        $this->syncPaymentMethods($hostel, $data['payment_methods'] ?? []);

        return $hostel;
    }

    private function syncPaymentMethods(Hostel $hostel, array $methods): void
    {
        $hostel->paymentMethods()->delete();
        foreach ($methods as $m) {
            if (empty($m['method_name']) || empty($m['account_number']) || empty($m['account_name'])) {
                continue;
            }
            HostelPaymentMethod::create([
                'hostel_id'      => $hostel->id,
                'method_name'    => $m['method_name'],
                'account_number' => $m['account_number'],
                'account_name'   => $m['account_name'],
            ]);
        }
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

        $url = $this->cloudinary->upload($image, 'licenses');

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
            $url = $this->cloudinary->upload($file, "hostel-images/{$hostelId}");

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
        $publishedId     = StatusCode::where('context', 'Hostel')
            ->where('label', 'Published')
            ->value('id');

        $activeOwnerId   = StatusCode::where('context', 'User')
            ->where('label', 'Active')
            ->value('id');

        $query = Hostel::with(['township:id,name', 'primaryImage:id,hostel_id,image_url,is_primary'])
            ->withMin('rooms', 'price_per_month')
            ->withMax('rooms', 'price_per_month')
            ->where('listing_status_id', $publishedId)
            ->whereHas('owner', fn ($q) => $q->where('user_status_id', $activeOwnerId));

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

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

        if (!empty($filters['facilities']) && is_array($filters['facilities'])) {
            foreach ($filters['facilities'] as $facility) {
                $query->whereRaw("JSON_CONTAINS(facilities, ?)", [json_encode($facility)]);
            }
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
        return Hostel::with(['township', 'listingStatus', 'rooms.beds', 'rooms.type', 'businessLicenses.status', 'images', 'paymentMethods'])
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
        $this->cloudinary->delete($image->image_url);
        $image->delete();
    }

    public function updateRoom(int $ownerId, int $roomId, array $data): Room
    {
        $room = Room::with('beds')->findOrFail($roomId);

        Hostel::where('id', $room->hostel_id)
            ->where('owner_id', $ownerId)
            ->firstOrFail();

        $room->update([
            'label'           => $data['label'],
            'type_id'         => $data['type_id'],
            'price_per_month' => $data['price_per_month'],
        ]);

        $newCapacity  = (int) $data['max_occupancy'];
        $currentBeds  = $room->beds->count();
        $occupiedCount = $room->beds->where('is_occupied', true)->count();

        if ($newCapacity < $occupiedCount) {
            throw new \Exception('Cannot reduce capacity; ' . $occupiedCount . ' bed(s) are currently occupied.');
        }

        if ($newCapacity > $currentBeds) {
            for ($i = $currentBeds + 1; $i <= $newCapacity; $i++) {
                Bed::create(['room_id' => $room->id, 'bed_number' => $i, 'is_occupied' => false]);
            }
        } elseif ($newCapacity < $currentBeds) {
            $toDelete = $room->beds
                ->where('is_occupied', false)
                ->sortByDesc('bed_number')
                ->take($currentBeds - $newCapacity)
                ->pluck('id');

            Bed::whereIn('id', $toDelete)->delete();
        }

        $room->update(['max_occupancy' => $newCapacity]);

        return $room->load(['beds', 'type']);
    }

    public function deleteRoom(int $ownerId, int $roomId): void
    {
        $room = Room::with('beds')->findOrFail($roomId);

        Hostel::where('id', $room->hostel_id)
            ->where('owner_id', $ownerId)
            ->firstOrFail();

        $occupiedCount = $room->beds->where('is_occupied', true)->count();

        if ($occupiedCount > 0) {
            throw new \Exception("Cannot remove this room: {$occupiedCount} bed(s) are currently occupied.");
        }

        $room->beds()->delete();
        $room->delete();
    }

    public function updateHostel(int $hostelId, array $data): Hostel
    {
        $hostel = Hostel::findOrFail($hostelId);
        $hostel->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'address'     => $data['address'],
            'house_rules' => $data['house_rules'] ?? null,
            'facilities'  => $data['facilities'] ?? [],
            'type'        => $data['type'],
            'township_id' => $data['township_id'],
        ]);

        $this->syncPaymentMethods($hostel, $data['payment_methods'] ?? []);

        return $hostel->load(['township', 'listingStatus']);
    }
}
