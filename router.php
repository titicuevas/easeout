<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

// Configurar el manejo de errores personalizado
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Validar y sanitizar la URI
if (strlen($uri) > 2048 || preg_match('/[\x00-\x1F\x7F]/', $uri)) {
    http_response_code(400);
    exit('Invalid request');
}

// Definir tipos MIME comunes
$mimeTypes = [
    'css' => 'text/css',
    'js' => 'application/javascript',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    'eot' => 'application/vnd.ms-fontobject',
    'ico' => 'image/x-icon',
    'json' => 'application/json',
    'xml' => 'application/xml',
    'pdf' => 'application/pdf'
];

// Prevenir directory traversal
$cleanUri = str_replace('..', '', $uri);
$filePath = __DIR__ . '/public' . $cleanUri;

// Si el archivo existe, servirlo con el tipo MIME correcto
if ($uri !== '/' && file_exists($filePath) && is_file($filePath)) {
    $extension = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
    
    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
        header('X-Content-Type-Options: nosniff');
    }
    
    // Configurar cache para archivos estáticos
    $etag = '"' . md5_file($filePath) . '"';
    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=31536000');
    
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }
    
    readfile($filePath);
    exit;
}

// Si no es un archivo estático, pasar a index.php
require_once __DIR__ . '/public/index.php'; 