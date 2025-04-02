<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JournalEntry;

class JournalEntryController extends Controller
{
    public function index()
    {
        $entries = auth()->user()->journalEntries()
            ->with('tags')
            ->latest()
            ->paginate(12);

        return Inertia::render('Journal/Index', [
            'entries' => $entries
        ]);
    }

    public function create()
    {
        return Inertia::render('Journal/Create');
    }
} 