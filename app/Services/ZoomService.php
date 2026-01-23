<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ZoomService
{
    protected string $accountId;
    protected string $clientId;
    protected string $clientSecret;
    protected string $baseUrl;
    protected string $authUrl;

    public function __construct()
    {
        $this->accountId = config('services.zoom.account_id', '');
        $this->clientId = config('services.zoom.client_id', '');
        $this->clientSecret = config('services.zoom.client_secret', '');
        $this->baseUrl = config('services.zoom.base_url', 'https://api.zoom.us/v2/');
        $this->authUrl = config('services.zoom.auth_url', 'https://zoom.us/oauth/token');
    }

    /**
     * Get the OAuth token from Zoom
     */
    public function getAccessToken(): ?string
    {
        return Cache::remember('zoom_access_token', 3500, function () {
            try {
                $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                    ->asForm()
                    ->post($this->authUrl, [
                        'grant_type' => 'account_credentials',
                        'account_id' => $this->accountId,
                    ]);

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::error('Zoom Auth Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('Zoom Auth Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Create a Zoom Meeting
     * 
     * @param array $data ['topic', 'start_time', 'duration', 'agenda']
     * @return array|null
     */
    public function createMeeting(array $data): ?array
    {
        $token = $this->getAccessToken();

        if (!$token) {
            return null;
        }

        try {
            $response = Http::withToken($token)
                ->post($this->baseUrl . 'users/me/meetings', [
                    'topic' => $data['topic'] ?? 'Verification Call',
                    'type' => 2, // Scheduled meeting
                    'start_time' => $data['start_time'], // ISO 8601 format
                    'duration' => $data['duration'] ?? 30,
                    'agenda' => $data['agenda'] ?? '',
                    'settings' => [
                        'host_video' => true,
                        'participant_video' => true,
                        'join_before_host' => false,
                        'mute_upon_entry' => true,
                        'waiting_room' => true,
                    ]
                ]);

            if ($response->successful()) {
                $meeting = $response->json();
                $meetingId = $meeting['id'];
                $password = $meeting['password'] ?? null;

                // Generate web client URL (opens in browser without app download)
                $webClientUrl = "https://zoom.us/wc/{$meetingId}/join";
                if ($password) {
                    $webClientUrl .= "?pwd=" . urlencode($password);
                }

                return [
                    'id' => $meetingId,
                    'join_url' => $webClientUrl, // Use web client URL instead of app URL
                    'start_url' => $meeting['start_url'],
                    'password' => $password,
                ];
            }


            Log::error('Zoom Meeting Creation Failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Zoom Meeting Creation Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a Zoom Meeting
     */
    public function deleteMeeting(string $meetingId): bool
    {
        $token = $this->getAccessToken();

        if (!$token) {
            return false;
        }

        try {
            $response = Http::withToken($token)
                ->delete($this->baseUrl . "meetings/{$meetingId}");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Zoom Meeting Deletion Exception: ' . $e->getMessage());
            return false;
        }
    }
}
