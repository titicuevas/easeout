<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if($this->app->environment('production')) {
            URL::forceScheme('https');
            
            // Temporalmente mostrar errores en producción
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        }

        try {
            // Verificar conexión a la base de datos
            $pdo = DB::connection()->getPdo();
            Log::info('Conexión a la base de datos establecida correctamente');
            Log::info('Database Name: ' . DB::connection()->getDatabaseName());
            
            // Verificar si las tablas necesarias existen
            if (!DB::getSchemaBuilder()->hasTable('users')) {
                Log::error('La tabla users no existe. Intentando ejecutar migraciones...');
                // Intentar ejecutar migraciones automáticamente
                try {
                    \Artisan::call('migrate', ['--force' => true]);
                    Log::info('Migraciones ejecutadas correctamente');
                } catch (Exception $e) {
                    Log::error('Error al ejecutar migraciones: ' . $e->getMessage());
                    // Guardar información detallada del error
                    Log::error('Detalles de la conexión:');
                    Log::error('DB_HOST: ' . config('database.connections.mysql.host'));
                    Log::error('DB_PORT: ' . config('database.connections.mysql.port'));
                    Log::error('DB_DATABASE: ' . config('database.connections.mysql.database'));
                    Log::error('DB_USERNAME: ' . config('database.connections.mysql.username'));
                }
            }
            
        } catch (Exception $e) {
            Log::error('Error de conexión a la base de datos: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Mostrar error en la respuesta HTTP para debugging
            if($this->app->environment('production')) {
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Error de base de datos',
                    'message' => $e->getMessage(),
                    'db_host' => config('database.connections.mysql.host'),
                    'db_port' => config('database.connections.mysql.port'),
                    'db_name' => config('database.connections.mysql.database')
                ]);
                exit;
            }
        }
    }
}
