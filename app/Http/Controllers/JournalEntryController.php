<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function index()
    {
        $entries = auth()->user()->journalEntries()
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

    public function store(Request $request)
    {
        $request->validate([
            'mood' => 'required|string',
            'content' => 'nullable|string',
            'duration' => 'nullable|numeric',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a,mpeg'
        ]);

        try {
            $entry = new JournalEntry();
            $entry->user_id = auth()->id();
            $entry->mood = $request->mood;
            $entry->content = $request->content;
            $entry->metadata = [
                'timestamp' => now()->toISOString(),
                'hasAudio' => $request->hasFile('audio'),
                'duration' => $request->input('duration', 0)
            ];

            if ($request->hasFile('audio')) {
                $file = $request->file('audio');
                $extension = $file->getClientOriginalExtension();
                $fileName = 'audio_' . auth()->id() . '_' . time() . '.' . $extension;
                $path = $file->storeAs('audio-recordings', $fileName, 'public');
                
                if ($path) {
                    $entry->metadata['audioUrl'] = Storage::url($path);
                    $entry->metadata['audioFileName'] = $fileName;
                }
            }

            $entry->save();

            return redirect()->route('journal-entries.index')
                ->with('success', 'Entrada guardada correctamente');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al guardar la entrada: ' . $e->getMessage()]);
        }
    }

    /**
     * Elimina una entrada del diario
     */
    public function destroy(JournalEntry $journalEntry)
    {
        // Verificar que el usuario actual es el propietario de la entrada
        if ($journalEntry->user_id !== auth()->id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
            // Si hay un archivo de audio, eliminarlo
            if (isset($journalEntry->metadata['audioFileName'])) {
                Storage::disk('public')->delete('audio-recordings/' . $journalEntry->metadata['audioFileName']);
            }

            $journalEntry->delete();

            return redirect()->route('journal-entries.index')
                ->with('success', 'Entrada eliminada correctamente');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al eliminar la entrada: ' . $e->getMessage()]);
        }
    }
} 