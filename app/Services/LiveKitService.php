<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Illuminate\Support\Str;

class LiveKitService
{
    protected string $apiKey;
    protected string $apiSecret;
    protected string $host;

    public function __construct()
    {
        $this->apiKey = config('services.livekit.api_key');
        $this->apiSecret = config('services.livekit.api_secret');
        $this->host = config('services.livekit.url');
    }

    /**
     * Generate an Access Token for a participant.
     */
    public function generateToken(string $roomName, string $participantIdentity, string $participantName, bool $isAdmin = false): string
    {
        $now = time();
        $customClaims = [
            'iss' => $this->apiKey,
            'sub' => $participantIdentity,
            'name' => $participantName, // Name at root level for LiveKit
            'nbf' => $now,
            'exp' => $now + (60 * 60 * 6), // 6 hours
            'video' => [
                'room' => $roomName,
                'roomJoin' => true,
                'canPublish' => true, 
                'canSubscribe' => true,
                'canPublishData' => true,
            ]
        ];

        // Admin (Ghost Mode) logic can be refined here
        if ($isAdmin) {
             $customClaims['video']['hidden'] = true; // Experimental: LiveKit 'hidden' participant
             $customClaims['video']['canPublish'] = false; // Start as silent
        }

        return JWT::encode($customClaims, $this->apiSecret, 'HS256');
    }
}
