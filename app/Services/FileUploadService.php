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
    public function upload(UploadedFile $file, string $directory, string $username, string $type): string
    {
        $extension = $file->getClientOriginalExtension();
        $date = now()->format('Y-m-d');
        $timestamp = now()->timestamp;
        $safeUsername = Str::slug($username);
        
        // Format: [username]-[type]-[date]-[timestamp].[ext]
        $filename = "{$safeUsername}-{$type}-{$date}-{$timestamp}.{$extension}";
        
        return $file->storeAs($directory, $filename, 'public');
    }
}
