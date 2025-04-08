#!/bin/sh
set -e

echo "🚀 Iniciando la aplicación..."

# Configurar el puerto para Railways
export PORT=${PORT:-8080}

# Verificar variables de entorno críticas
echo "📝 Verificando variables de entorno..."
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY no está configurada, generando una nueva..."
    php artisan key:generate --force
fi

if [ -z "$DB_HOST" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: Variables de base de datos no configuradas"
    exit 1
fi

# Crear directorios necesarios
echo "📁 Preparando directorios..."
mkdir -p /var/www/storage/logs \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/framework/cache \
         /var/www/bootstrap/cache

# Establecer permisos
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Limpiar caché
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Intentar conectar a la base de datos
echo "🔄 Verificando conexión a la base de datos..."
php -r "
\$tries = 30;
while (\$tries > 0) {
    try {
        new PDO(
            'mysql:host={\$_ENV['DB_HOST']};port={\$_ENV['DB_PORT']};dbname={\$_ENV['DB_DATABASE']}',
            '{\$_ENV['DB_USERNAME']}',
            '{\$_ENV['DB_PASSWORD']}'
        );
        echo 'Conexión exitosa a la base de datos\n';
        break;
    } catch (Exception \$e) {
        echo 'Intentando conectar a la base de datos... ' . \$tries . ' intentos restantes\n';
        \$tries--;
        if (\$tries === 0) {
            echo 'Error de conexión: ' . \$e->getMessage() . '\n';
            exit(1);
        }
        sleep(1);
    }
}"

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
php artisan migrate --force || echo "⚠️ Error en migraciones, pero continuando..."

# Optimizar
echo "⚙️ Optimizando la aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Verificar que PHP puede escribir en storage
echo "📝 Verificando permisos de escritura..."
if ! touch /var/www/storage/logs/laravel.log; then
    echo "❌ Error: No se puede escribir en el directorio de logs"
    exit 1
fi

# Iniciar el servidor PHP
echo "🚀 Iniciando servidor PHP en puerto $PORT..."
exec php artisan serve --host=0.0.0.0 --port=$PORT 