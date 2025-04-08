#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}
echo "📡 Puerto configurado: $PORT"

# Verificar variables de entorno críticas
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY no está configurada, generando una nueva..."
    php artisan key:generate --force
fi

# Crear directorio para el healthcheck
mkdir -p /tmp/health
echo "starting" > /tmp/health/status

# Verificar y crear directorios esenciales
echo "📁 Preparando directorios..."
mkdir -p /var/www/storage/logs \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/framework/cache \
         /var/www/bootstrap/cache

# Establecer permisos
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Limpiar cache existente
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Configuración básica de Nginx
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT default_server;
    server_name _;
    root /var/www/public;
    index index.php;

    # Logging para debug
    error_log /dev/stderr debug;
    access_log /dev/stdout;

    location /health {
        access_log off;
        add_header Content-Type text/plain;
        alias /tmp/health/status;
    }

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param PATH_INFO \$fastcgi_path_info;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_read_timeout 300;
    }
}
EOF

echo "🔄 Iniciando PHP-FPM..."
php-fpm -D

# Esperar a que PHP-FPM esté listo
for i in $(seq 1 5); do
    if pgrep php-fpm > /dev/null; then
        echo "✅ PHP-FPM está ejecutándose"
        break
    fi
    sleep 1
done

# Verificar la configuración de Laravel
echo "🔍 Verificando la configuración de Laravel..."
if php artisan env; then
    echo "✅ Configuración de Laravel OK"
else
    echo "⚠️ Advertencia: Problemas con la configuración de Laravel"
fi

# Marcar como listo para el healthcheck
echo "ready" > /tmp/health/status

# Ejecutar comandos de Laravel en segundo plano
(
    echo "⚙️ Iniciando tareas en segundo plano..."
    
    # Generar caché de configuración
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Intentar migraciones con más información
    echo "🔄 Ejecutando migraciones..."
    if php artisan migrate --force --verbose; then
        echo "✅ Migraciones completadas exitosamente"
    else
        echo "⚠️ Error en migraciones, pero continuando..."
        # Guardar el estado de la base de datos para diagnóstico
        php artisan migrate:status
    fi
) &

# Verificar que nginx puede iniciar
echo "🔍 Verificando configuración de Nginx..."
nginx -t

echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;" 