<?php

use App\Http\Controllers\Api\AudioRecordingController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Rutas para entradas del diario
    Route::apiResource('journal-entries', JournalEntryController::class);

    // Rutas para grabaciones de audio
    Route::apiResource('audio-recordings', AudioRecordingController::class);
    Route::get('audio-recordings/{audioRecording}/download', [AudioRecordingController::class, 'download']);

    // Rutas para etiquetas
    Route::apiResource('tags', TagController::class);
}); 