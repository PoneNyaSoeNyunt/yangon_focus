<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected ?Cloudinary $cloudinary = null;

    protected function client(): Cloudinary
    {
        if ($this->cloudinary) {
            return $this->cloudinary;
        }

        $url = config('filesystems.disks.cloudinary.url') ?: env('CLOUDINARY_URL');

        if (empty($url)) {
            throw new \RuntimeException('CLOUDINARY_URL is not configured. Set it in your .env or Render environment.');
        }

        return $this->cloudinary = new Cloudinary($url);
    }

    /**
     * Upload a file to Cloudinary and return its secure URL.
     */
    public function upload(UploadedFile $file, string $folder): string
    {
        $result = $this->client()->uploadApi()->upload($file->getRealPath(), [
            'folder'        => 'yangon-focus/' . $folder,
            'resource_type' => 'image',
        ]);

        return $result['secure_url'];
    }

    /**
     * Delete an image from Cloudinary by its URL.
     */
    public function delete(string $url): void
    {
        $publicId = $this->extractPublicId($url);

        if ($publicId) {
            $this->client()->uploadApi()->destroy($publicId);
        }
    }

    /**
     * Extract the Cloudinary public_id from a secure URL.
     */
    private function extractPublicId(string $url): ?string
    {
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
        if (preg_match('#/upload/(?:v\d+/)?(.+)\.\w+$#', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
