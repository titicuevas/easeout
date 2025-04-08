#!/bin/bash

# Esperar a que la base de datos esté lista (si es necesario)
# sleep 10

# Generar key si no existe
php artisan key:generate --force

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
php artisan migrate --force

# Iniciar Apache
exec "$@" 