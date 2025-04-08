#!/bin/sh

# Generar clave de la aplicación si no existe
php artisan key:generate --force

# Limpiar y optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
php artisan migrate --force

# Iniciar PHP-FPM
php-fpm -D

# Iniciar Nginx
nginx -g "daemon off;" 