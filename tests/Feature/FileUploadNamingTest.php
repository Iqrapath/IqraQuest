<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Illuminate\Support\Str;

class FileUploadNamingTest extends TestCase
{
    public function test_avatar_upload_naming_convention()
    {
        Storage::fake('public');

        // Use make() to avoid DB creation
        $user = User::factory()->make(['name' => 'John Doe']);
        $file = UploadedFile::fake()->image('avatar.jpg');

        // Trigger the mutator
        $user->avatar = $file;
        
        // We don't save(), just check the attribute
        $path = $user->getAttributes()['avatar'];

        $date = now()->format('Y-m-d');
        // Pattern: john-doe-avatar-YYYY-MM-DD-timestamp.jpg
        
        $filename = basename($path);
        
        $this->assertStringStartsWith('john-doe-avatar-' . $date, $filename);
        $this->assertStringEndsWith('.jpg', $filename);
        
        // Also verify the file exists in storage (since the service stores it immediately)
        Storage::disk('public')->assertExists($path);
    }

    public function test_file_upload_service_direct_usage()
    {
        Storage::fake('public');

        $service = new FileUploadService();
        $file = UploadedFile::fake()->create('document.pdf', 100);
        $username = 'Jane Doe';
        
        $path = $service->upload($file, 'documents', $username, 'certificate');
        
        $date = now()->format('Y-m-d');
        $filename = basename($path);
        
        $this->assertStringStartsWith('jane-doe-certificate-' . $date, $filename);
        $this->assertStringEndsWith('.pdf', $filename);
    }
}
