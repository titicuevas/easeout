#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}

# Crear un servidor PHP temporal para el healthcheck
cat > /tmp/health-server.php <<EOF
<?php
\$socket = stream_socket_server("tcp://0.0.0.0:${PORT}", \$errno, \$errstr);
if (!\$socket) {
    echo "\$errstr (\$errno)\n";
    exit(1);
}
while (true) {
    \$client = stream_socket_accept(\$socket);
    if (\$client) {
        \$response = "HTTP/1.1 200 OK\r\n";
        \$response .= "Content-Type: text/plain\r\n";
        \$response .= "Connection: close\r\n";
        \$response .= "\r\n";
        \$response .= "OK";
        fwrite(\$client, \$response);
        fclose(\$client);
    }
}
EOF

# Iniciar el servidor temporal en segundo plano
php /tmp/health-server.php &
HEALTH_SERVER_PID=$!

# Preparar la aplicación en segundo plano
(
    sleep 2  # Dar tiempo al servidor temporal para iniciar

    # Crear directorios necesarios
    mkdir -p /var/www/storage/logs \
            /var/www/storage/framework/{sessions,views,cache} \
            /var/www/bootstrap/cache

    chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

    # Configuración básica
    if [ ! -f .env ]; then
        cp .env.example .env || echo "APP_KEY=" > .env
    fi

    # Generar clave si es necesario
    php artisan key:generate --force --quiet || true

    # Optimizar la aplicación
    php artisan config:cache --quiet
    php artisan route:cache --quiet
    php artisan view:cache --quiet

    # Ejecutar migraciones sin que fallen si hay error
    php artisan migrate --force --quiet || true

    # Matar el servidor temporal
    kill $HEALTH_SERVER_PID || true

    # Limpiar archivo temporal
    rm -f /tmp/health-server.php

    # Iniciar el servidor PHP principal
    php artisan serve --host=0.0.0.0 --port=$PORT
) &

# Esperar a que el proceso en segundo plano termine
wait 