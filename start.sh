#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}
echo "📡 Puerto configurado: $PORT"

# Crear archivo de healthcheck temporal
mkdir -p /tmp/health
echo "OK" > /tmp/health/status

# Verificar directorios y permisos primero
echo "📁 Verificando directorios y permisos..."
mkdir -p /var/www/storage/logs /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/framework/cache
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

echo "📦 Configurando la aplicación..."

# Generar clave de la aplicación si no existe
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

# Iniciar PHP-FPM primero
echo "🌐 Iniciando PHP-FPM..."
php-fpm -D

# Esperar a que PHP-FPM esté listo
echo "⏳ Esperando a que PHP-FPM esté listo..."
for i in $(seq 1 30); do
    if ps aux | grep php-fpm | grep -v grep > /dev/null; then
        echo "✅ PHP-FPM está ejecutándose"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Error: PHP-FPM no se pudo iniciar después de 30 intentos"
        exit 1
    fi
    sleep 1
done

# Generar configuración de Nginx
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT default_server;
    listen [::]:$PORT default_server;
    server_name _;
    root /var/www/public;
    index index.php;

    # Configuración de timeouts
    fastcgi_read_timeout 300;
    proxy_read_timeout 300;
    client_max_body_size 50M;

    # Healthcheck endpoint - respuesta rápida desde archivo
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
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param PATH_INFO \$fastcgi_path_info;
    }
}
EOF

# Verificar configuración de Nginx
echo "🔍 Verificando configuración de Nginx..."
nginx -t

echo "🔄 Ejecutando migraciones en segundo plano..."
(
    # Ejecutar migraciones con reintentos
    MAX_RETRIES=5
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if php artisan migrate --force; then
            echo "✅ Migraciones completadas exitosamente"
            break
        else
            RETRY_COUNT=$((RETRY_COUNT+1))
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "⚠️ Reintento de migraciones ($RETRY_COUNT/$MAX_RETRIES)..."
                sleep 5
            else
                echo "❌ Las migraciones fallaron después de $MAX_RETRIES intentos"
                rm -f /tmp/health/status
                echo "ERROR" > /tmp/health/status
            fi
        fi
    done
) &

# Iniciar Nginx en primer plano
echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;" 