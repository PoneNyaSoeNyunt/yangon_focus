<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Upload a file and return its public URL.
     * Delegates to Cloudinary when FILESYSTEM_DISK=cloudinary, otherwise uses local public disk.
     */
    public function upload(UploadedFile $file, string $folder): string
    {
        if (config('filesystems.default') === 'cloudinary') {
            return $this->cloudinary->upload($file, $folder);
        }

        $path = $file->store($folder, 'public');

        return Storage::disk('public')->url($path);
    }

    /**
     * Delete an image by its URL.
     */
    public function delete(string $url): void
    {
        if (str_contains($url, 'cloudinary.com')) {
            $this->cloudinary->delete($url);
            return;
        }

        // Local storage — strip the base URL prefix to get the relative path
        $prefix = Storage::disk('public')->url('');
        $path   = str_replace($prefix, '', $url);

        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
