<?php

// Mostrar todos los errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Verificando conexión a la base de datos...\n\n";

// Cargar variables de entorno
$env = parse_ini_file('../.env');

echo "Configuración actual:\n";
echo "DB_CONNECTION: " . ($_ENV['DB_CONNECTION'] ?? 'no definido') . "\n";
echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? 'no definido') . "\n";
echo "DB_PORT: " . ($_ENV['DB_PORT'] ?? 'no definido') . "\n";
echo "DB_DATABASE: " . ($_ENV['DB_DATABASE'] ?? 'no definido') . "\n";
echo "DB_USERNAME: " . ($_ENV['DB_USERNAME'] ?? 'no definido') . "\n";

try {
    $dsn = "mysql:host=" . $_ENV['DB_HOST'] . ";port=" . $_ENV['DB_PORT'] . ";dbname=" . $_ENV['DB_DATABASE'];
    $pdo = new PDO($dsn, $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "\nConexión exitosa!\n";
    
    // Verificar tablas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "\nTablas encontradas:\n";
    print_r($tables);
    
} catch (PDOException $e) {
    echo "\nError de conexión: " . $e->getMessage() . "\n";
} 