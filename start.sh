#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}
echo "📡 Puerto configurado: $PORT"

# Crear directorio para el healthcheck
mkdir -p /tmp/health
echo "starting" > /tmp/health/status

# Verificar directorios esenciales
mkdir -p /var/www/storage/logs /var/www/storage/framework/{sessions,views,cache}
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Configuración básica de Nginx
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT default_server;
    server_name _;
    root /var/www/public;
    index index.php;

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
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
}
EOF

# Iniciar PHP-FPM
php-fpm -D

# Esperar a que PHP-FPM esté listo
for i in $(seq 1 5); do
    if pgrep php-fpm > /dev/null; then
        break
    fi
    sleep 1
done

# Marcar como listo para el healthcheck
echo "ready" > /tmp/health/status

# Ejecutar comandos de Laravel en segundo plano
(
    # Esperar un momento para que los servicios estén completamente iniciados
    sleep 5
    
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Intentar migraciones
    if php artisan migrate --force; then
        echo "✅ Migraciones completadas"
    else
        echo "⚠️ Error en migraciones, pero continuando..."
    fi
) &

# Iniciar Nginx en primer plano
exec nginx -g "daemon off;" 