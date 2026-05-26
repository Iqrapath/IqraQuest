<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: #ffffff;
        }

        html.dark {
            background-color: #1c2a3a;
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">


    {{-- Paystack Inline JS --}}
    <script src="https://js.paystack.co/v1/inline.js"></script>

    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        $reverb = config('broadcasting.connections.reverb', []);
        $reverbOptions = is_array($reverb) ? ($reverb['options'] ?? []) : [];
        $appUrl = (string) config('app.url');
        $appUrlHost = parse_url($appUrl, PHP_URL_HOST) ?: 'localhost';
        $appUrlScheme = parse_url($appUrl, PHP_URL_SCHEME) ?: 'https';
        $appUsesHttps = $appUrlScheme === 'https';

        $reverbHost = $reverbOptions['host'] ?? null;
        if (!$reverbHost) {
            $reverbHost = $appUrlHost;
        }

        // If the app is on HTTPS, avoid shipping local hostnames (localhost/127.0.0.1) to the browser,
        // since "localhost" would mean the end-user's machine instead of your server.
        $reverbHostWasLocal = false;
        $localHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
        if ($appUsesHttps && $reverbHost && in_array(strtolower((string) $reverbHost), $localHosts, true)) {
            $reverbHost = $appUrlHost;
            $reverbHostWasLocal = true;
        }

        $reverbScheme = $reverbOptions['scheme'] ?? $appUrlScheme;
        if ($appUsesHttps && $reverbScheme === 'http') {
            $reverbScheme = 'https';
        }

        // Build in PHP — @json(...) breaks when the array contains $var['key'] (] closes the Blade directive early).
        $reverbPort = (int) ($reverbOptions['port'] ?? ($reverbScheme === 'https' ? 443 : 80));
        if ($reverbHostWasLocal && $reverbScheme === 'https') {
            $reverbPort = 443;
        } elseif ($reverbHostWasLocal && $reverbScheme === 'http') {
            $reverbPort = 80;
        }

        $reverbClient = [
            'key' => is_array($reverb) ? ($reverb['key'] ?? '') : '',
            'host' => $reverbHost,
            'port' => $reverbPort,
            'scheme' => $reverbScheme,
        ];
    @endphp
    <meta name="reverb-client" content='@json($reverbClient)'>

    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- Inertia React v2 reads initial state from #app data-page, not the legacy <script type="application/json"> tag. --}}
    @php
        $__inertiaSsrBody = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();
    @endphp
    @if ($__inertiaSsrBody)
        {!! $__inertiaSsrBody->body !!}
    @else
        <div id="app" data-page='@json($page)'></div>
    @endif
</body>

</html>
