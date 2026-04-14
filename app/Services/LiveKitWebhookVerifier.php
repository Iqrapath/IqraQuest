<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Validates LiveKit webhook requests (Authorization JWT + SHA256 of raw body).
 * @see https://docs.livekit.io/home/server/webhooks/
 */
class LiveKitWebhookVerifier
{
    public function verify(string $rawBody, ?string $authorizationHeader): bool
    {
        $apiKey = (string) config('services.livekit.api_key');
        $apiSecret = (string) config('services.livekit.api_secret');

        if ($apiKey === '' || $apiSecret === '') {
            return filter_var(env('LIVEKIT_WEBHOOK_SKIP_VERIFY', false), FILTER_VALIDATE_BOOLEAN)
                && app()->environment('local');
        }

        $token = $this->bearerToken($authorizationHeader);
        if ($token === null || $token === '') {
            return false;
        }

        try {
            $decoded = JWT::decode($token, new Key($apiSecret, 'HS256'));
            $claims = (array) $decoded;

            if (($claims['iss'] ?? '') !== $apiKey) {
                return false;
            }

            $sha256Claim = $claims['sha256'] ?? null;
            if (! is_string($sha256Claim) || $sha256Claim === '') {
                return false;
            }

            $bodyDigest = hash('sha256', $rawBody, true);

            return hash_equals($sha256Claim, base64_encode($bodyDigest));
        } catch (\Throwable) {
            return false;
        }
    }

    protected function bearerToken(?string $authorizationHeader): ?string
    {
        if ($authorizationHeader === null || $authorizationHeader === '') {
            return null;
        }

        if (preg_match('/^\s*Bearer\s+(.+)\s*$/i', $authorizationHeader, $m)) {
            return trim($m[1]);
        }

        return trim($authorizationHeader);
    }
}
