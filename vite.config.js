import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react({
            // Configuración específica para React
            jsxRuntime: 'automatic',
            babel: {
                plugins: ['@babel/plugin-syntax-jsx'],
            },
        }),
    ],
    server: {
        https: process.env.APP_ENV === 'production',
        host: '0.0.0.0',
        hmr: {
            host: 'localhost'
        }
    },
    build: {
        // Usa la URL base según el entorno
        base: process.env.APP_ENV === 'production' 
            ? 'https://easeout-production.up.railway.app'
            : '/',
    }
});
