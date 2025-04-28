<?php

return [
    'paths' => ['*', 'api/*', 'sanctum/csrf-cookie', 'build/*', 'build/assets/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://easeout.up.railway.app',
        'https://easeout-production.up.railway.app',
        'http://localhost:8000',
        'http://localhost:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Access-Control-Allow-Origin'],

    'max_age' => 86400,

    'supports_credentials' => true,
]; 