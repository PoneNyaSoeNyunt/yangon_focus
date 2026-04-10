<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    /**
     * Upload a file to Cloudinary and return its secure URL.
     */
    public function upload(UploadedFile $file, string $folder): string
    {
        $result = cloudinary()->uploadApi()->upload($file->getRealPath(), [
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
            cloudinary()->uploadApi()->destroy($publicId);
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
