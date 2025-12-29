<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload a file with a standardized name.
     *
     * @param UploadedFile $file The file to upload
     * @param string $directory The directory to store the file in (e.g., 'avatars')
     * @param string $username The username to include in the filename
     * @param string $type The type of file (e.g., 'avatar', 'certificate')
     * @return string The path of the uploaded file
     */
    /**
     * Download an image from a URL and store it locally.
     *
     * @param string $url The URL of the image to download
     * @param string $directory The directory to store the file in (e.g., 'avatars')
     * @param string $username The username to include in the filename
     * @param string $type The type of file (e.g., 'avatar')
     * @return string|null The path of the stored file, or null on failure
     */
    public function uploadFromUrl(string $url, string $directory, string $username, string $type): ?string
    {
        try {
            $contents = file_get_contents($url);
            if ($contents === false) {
                return null;
            }

            // Determine extension from URL or content
            $extension = 'jpg'; // Default to jpg for avatars
            $pathInfo = pathinfo(parse_url($url, PHP_URL_PATH));
            if (isset($pathInfo['extension'])) {
                $extension = $pathInfo['extension'];
            }

            $date = now()->format('Y-m-d');
            $timestamp = now()->timestamp;
            $safeUsername = \Illuminate\Support\Str::slug($username);
            $filename = "{$safeUsername}-{$type}-{$date}-{$timestamp}.{$extension}";
            
            $path = "{$directory}/{$filename}";
            \Illuminate\Support\Facades\Storage::disk('public')->put($path, $contents);
            
            return $path;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to upload file from URL: {$url}", ['exception' => $e]);
            return null;
        }
    }

    public function upload(UploadedFile $file, string $directory, string $username, string $type): string
    {
        $extension = $file->getClientOriginalExtension();
        $date = now()->format('Y-m-d');
        $timestamp = now()->timestamp;
        $safeUsername = \Illuminate\Support\Str::slug($username);
        
        // Format: [username]-[type]-[date]-[timestamp].[ext]
        $filename = "{$safeUsername}-{$type}-{$date}-{$timestamp}.{$extension}";
        
        return $file->storeAs($directory, $filename, 'public');
    }
}
