#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}

# Crear directorios necesarios
mkdir -p /var/www/storage/logs \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/framework/cache \
         /var/www/bootstrap/cache

chmod -R 777 /var/www/storage /var/www/bootstrap/cache

# Crear un router.php simple para el servidor integrado
cat > router.php <<EOF
<?php
if (php_sapi_name() !== 'cli-server') {
    die('Este script solo debe ejecutarse con el servidor web integrado de PHP');
}

// Endpoint de healthcheck
if (\$_SERVER['REQUEST_URI'] === '/health') {
    header('Content-Type: text/plain');
    echo "OK";
    exit;
}

// Servir archivos estáticos directamente
if (file_exists(__DIR__ . '/public' . \$_SERVER['REQUEST_URI'])) {
    return false;
}

// Redirigir todo lo demás a index.php
require __DIR__ . '/public/index.php';
EOF

# Generar clave si es necesario
php artisan key:generate --force --quiet || true

# Limpiar y optimizar en segundo plano
(
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear
    
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Intentar migraciones
    php artisan migrate --force --quiet || true
) &

# Iniciar el servidor PHP con el router personalizado
exec php -S "0.0.0.0:$PORT" router.php 