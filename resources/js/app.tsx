import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AppProvider } from './components/AppProvider';
import { LogoutDialogProvider } from './contexts/LogoutDialogContext';
import axios from 'axios';
import * as Sentry from "@sentry/react";

// Get CSRF token from meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

// Configure Laravel Echo for Reverb (uses Pusher protocol)
const echoConfig = {
    broadcaster: 'reverb' as const,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '80'),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
    authorizer: (channel: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                // console.log('Authorizing channel:', channel.name, 'Socket ID:', socketId);

                axios.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name,
                })
                    .then((response) => {
                        // console.log('Authorization successful:', response.data);
                        callback(null, response.data);
                    })
                    .catch((error) => {
                        // console.error('Broadcasting auth error:', error.response?.status, error.response?.data);
                        callback(error, null);
                    });
            },
        };
    },
};

// console.log('Echo Configuration:', echoConfig);

// Initialize Pusher globally for Echo
(window as any).Pusher = Pusher;

// Configure Echo for React hooks
configureEcho(echoConfig);

// Also create a global Echo instance for direct access
const echoInstance = new Echo(echoConfig);
(window as any).Echo = echoInstance;

// console.log('Echo configured and exposed globally:', echoInstance);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        sendDefaultPii: true,
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const normalized = name.replace(/^pages\//i, '');
        return resolvePageComponent(
            `./pages/${normalized}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <AppProvider initialPage={props.initialPage}>
                    <LogoutDialogProvider>
                        <App {...props} />
                    </LogoutDialogProvider>
                </AppProvider>
            </StrictMode>,
        );
    },
    // progress: {
    //     color: '#4B5563',
    // },
});

// This will set light / dark mode on load...
// initializeTheme();
