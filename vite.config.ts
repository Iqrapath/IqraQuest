import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    // resolve: {
    //     alias: {
    //         '@': '/resources/js',
    //     },
    // },
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split React and related libraries
                    'react-vendor': ['react', 'react-dom', '@inertiajs/react'],

                    // Split UI component libraries
                    'ui-components': [
                        '@headlessui/react',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-select',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-label',
                        'sonner',
                        'lucide-react',
                    ],

                    // Split heavy country/city data library (main culprit)
                    'country-city-data': ['country-state-city'],

                    // Split phone input library
                    'phone-input': ['react-phone-number-input'],
                },
            },
        },
        chunkSizeWarningLimit: 1000, // Increase limit to 1000kb but still get warnings for very large chunks
    },
});
