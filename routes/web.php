<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JournalEntryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CacheController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Ruta principal
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Rutas autenticadas
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Rutas del diario
    Route::get('/journal-entries', [JournalEntryController::class, 'index'])->name('journal-entries.index');
    Route::get('/journal-entries/create', [JournalEntryController::class, 'create'])->name('journal-entries.create');
    Route::post('/journal-entries', [JournalEntryController::class, 'store'])->name('journal-entries.store');
    Route::delete('/journal-entries/{journalEntry}', [JournalEntryController::class, 'destroy'])->name('journal-entries.destroy');

    // Rutas del perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/clear-cache', [CacheController::class, 'clear']);

require __DIR__.'/auth.php';
