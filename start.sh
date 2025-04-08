#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Verificar directorios y permisos primero
echo "📁 Verificando directorios y permisos..."
mkdir -p /var/www/storage/logs /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/framework/cache
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Esperar si es necesario a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté disponible..."
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

# Iniciar PHP-FPM con más logging
php-fpm -D --nodaemonize --fpm-config /usr/local/etc/php-fpm.d/www.conf &
PHP_FPM_PID=$!

# Esperar a que PHP-FPM esté listo
echo "⏳ Esperando a que PHP-FPM esté listo..."
sleep 2

# Verificar que PHP-FPM se inició correctamente
if ! ps -p $PHP_FPM_PID > /dev/null; then
    echo "❌ Error: PHP-FPM no se pudo iniciar"
    exit 1
fi

# Verificar que el socket/puerto está escuchando
if ! netstat -ln | grep ':9000' > /dev/null; then
    echo "❌ Error: PHP-FPM no está escuchando en el puerto 9000"
    exit 1
fi

echo "✅ PHP-FPM iniciado correctamente"

# Verificar configuración de Nginx
echo "🔍 Verificando configuración de Nginx..."
nginx -t

# Iniciar Nginx
echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;" 