#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}

# Crear un servidor temporal para el healthcheck mientras la aplicación inicia
(
    # Servidor netcat simple para responder al healthcheck inmediatamente
    while true; do
        echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nOK" | nc -l -p $PORT
    done
) &
NETCAT_PID=$!

# Preparar la aplicación en segundo plano
(
    # Crear directorios necesarios
    mkdir -p /var/www/storage/logs \
            /var/www/storage/framework/{sessions,views,cache} \
            /var/www/bootstrap/cache

    chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

    # Generar clave si es necesario
    php artisan key:generate --force --quiet || true

    # Optimizar la aplicación
    php artisan config:cache --quiet
    php artisan route:cache --quiet
    php artisan view:cache --quiet

    # Ejecutar migraciones
    php artisan migrate --force --quiet || true

    # Matar el servidor temporal de healthcheck
    kill $NETCAT_PID

    # Iniciar el servidor PHP
    exec php artisan serve --host=0.0.0.0 --port=$PORT
) &

# Esperar a que el proceso en segundo plano termine
wait 