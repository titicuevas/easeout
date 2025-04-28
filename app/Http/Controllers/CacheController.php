<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CacheController extends Controller
{
    public function clear()
    {
        \Artisan::call('config:clear');
        \Artisan::call('cache:clear');
        \Artisan::call('view:clear');
        \Artisan::call('route:clear');

        return response()->json(['message' => 'Cache cleared successfully']);
    }
} 