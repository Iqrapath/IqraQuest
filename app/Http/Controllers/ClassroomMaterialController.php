<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\ClassroomMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ClassroomMaterialController extends Controller
{
    /**
     * Get materials for a booking.
     */
    public function index(Booking $booking)
    {
        $this->authorizeAccess($booking);

        $materials = $booking->materials()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'type' => $m->file_type,
                'url' => $m->url,
                'size' => $m->formatted_size,
            ]);

        return response()->json(['materials' => $materials]);
    }

    /**
     * Upload a material.
     */
    public function store(Request $request, Booking $booking)
    {
        $this->authorizeAccess($booking);

        $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();
        $fileType = ClassroomMaterial::getFileTypeFromMime($mimeType);
        
        // Generate unique filename
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $filePath = "classroom-materials/{$booking->id}/{$fileName}";
        
        // Store file
        Storage::disk('public')->put($filePath, file_get_contents($file));

        // Create record
        $material = ClassroomMaterial::create([
            'booking_id' => $booking->id,
            'uploaded_by' => Auth::id(),
            'name' => pathinfo($originalName, PATHINFO_FILENAME),
            'original_name' => $originalName,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
        ]);

        return response()->json([
            'material' => [
                'id' => $material->id,
                'name' => $material->name,
                'type' => $material->file_type,
                'url' => $material->url,
                'size' => $material->formatted_size,
            ]
        ], 201);
    }

    /**
     * Delete a material.
     */
    public function destroy(Booking $booking, ClassroomMaterial $material)
    {
        $this->authorizeAccess($booking);

        // Only uploader or admin can delete
        if ($material->uploaded_by !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403, 'You can only delete your own materials.');
        }

        // Delete file from storage
        Storage::disk('public')->delete($material->file_path);
        
        // Delete record
        $material->delete();

        return response()->json(['message' => 'Material deleted successfully']);
    }

    /**
     * Check if user has access to the booking.
     */
    private function authorizeAccess(Booking $booking): void
    {
        $user = Auth::user();
        $isStudent = $booking->user_id === $user->id;
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        $isAdmin = $user->isAdmin();

        if (!$isStudent && !$isTeacher && !$isAdmin) {
            abort(403, 'You are not a participant of this class.');
        }
    }
}
