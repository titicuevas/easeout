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

# Copiar el archivo de entorno
cp .env.railways .env

# Crear un router.php simple para el servidor integrado
cat > router.php <<EOF
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Endpoint de healthcheck
if (\$_SERVER['REQUEST_URI'] === '/health') {
    header('Content-Type: text/plain');
    echo "OK";
    exit;
}

// Servir archivos estáticos directamente
\$uri = urldecode(parse_url(\$_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (\$uri !== '/' && file_exists(__DIR__ . '/public' . \$uri)) {
    \$ext = pathinfo(\$uri, PATHINFO_EXTENSION);
    switch (\$ext) {
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
    }
    return false;
}

// Establecer el directorio de trabajo
chdir(__DIR__ . '/public');

// Redirigir todo lo demás a index.php
require __DIR__ . '/public/index.php';
EOF

# Generar clave si es necesario
php artisan key:generate --force --quiet || true

# Limpiar caché
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
php artisan migrate --force --quiet || true

# Iniciar el servidor PHP
cd public && exec php -S "0.0.0.0:$PORT" ../router.php 