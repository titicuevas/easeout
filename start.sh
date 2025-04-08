#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}
echo "📡 Puerto configurado: $PORT"

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

echo "⚙️ Optimizando la aplicación..."

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🔄 Ejecutando migraciones..."

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
            exit 1
        fi
    fi
done

echo "🌐 Iniciando servicios..."

# Iniciar PHP-FPM
php-fpm -D

# Esperar a que PHP-FPM esté listo
echo "⏳ Esperando a que PHP-FPM esté listo..."
sleep 2

# Verificar que PHP-FPM está ejecutándose
if ! ps aux | grep php-fpm | grep -v grep > /dev/null; then
    echo "❌ Error: PHP-FPM no se pudo iniciar"
    exit 1
fi

# Generar configuración de Nginx
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT;
    listen [::]:$PORT;
    server_name _;
    root /var/www/public;
    index index.php;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Healthcheck endpoint
    location /health {
        access_log off;
        return 200 'healthy\n';
    }
}
EOF

# Verificar configuración de Nginx
echo "🔍 Verificando configuración de Nginx..."
nginx -t

# Iniciar Nginx
echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;" 