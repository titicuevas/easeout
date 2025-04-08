#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Esperar si es necesario a que la base de datos esté lista
sleep 5

echo "📦 Configurando la aplicación..."

# Generar clave de la aplicación si no existe
php artisan key:generate --force

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "⚙️ Optimizando la aplicación..."

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🔄 Ejecutando migraciones..."

# Ejecutar migraciones
php artisan migrate --force

echo "🌐 Iniciando servicios..."

# Asegurarse de que los directorios necesarios existen
mkdir -p /var/www/storage/logs
chown -R www-data:www-data /var/www/storage

# Iniciar PHP-FPM
php-fpm -D

# Verificar que PHP-FPM se inició correctamente
if ! ps aux | grep php-fpm | grep -v grep > /dev/null; then
    echo "❌ Error: PHP-FPM no se pudo iniciar"
    exit 1
fi

echo "✅ PHP-FPM iniciado correctamente"

# Iniciar Nginx
echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;" 