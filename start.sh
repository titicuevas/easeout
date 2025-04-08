#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}
echo "📡 Puerto configurado: $PORT"

# Verificar directorios esenciales
echo "📁 Preparando directorios..."
mkdir -p /var/www/storage/logs \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/framework/cache \
         /var/www/bootstrap/cache

# Establecer permisos
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Verificar variables de entorno críticas
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY no está configurada, generando una nueva..."
    php artisan key:generate --force
fi

# Limpiar y optimizar
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "⚙️ Optimizando..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
php artisan migrate --force || echo "⚠️ Error en migraciones, pero continuando..."

# Crear archivo de estado para healthcheck
mkdir -p /tmp/health
echo "OK" > /tmp/health/status

# Crear un script PHP simple para el healthcheck
cat > /var/www/public/health.php <<EOF
<?php
header('Content-Type: text/plain');
echo file_get_contents('/tmp/health/status');
EOF

# Iniciar el servidor PHP
echo "🚀 Iniciando servidor PHP en puerto $PORT..."
exec php artisan serve --host=0.0.0.0 --port=$PORT 