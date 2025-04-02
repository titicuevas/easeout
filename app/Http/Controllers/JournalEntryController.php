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
            'metadata' => 'required|json',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a,mpeg,ogg,webm|max:20480' // 20MB max
        ]);

        try {
            // Decodificar los metadatos JSON
            $metadata = json_decode($request->metadata, true);
            
            if (!is_array($metadata)) {
                throw new \Exception('Los metadatos deben ser un objeto JSON válido');
            }

            // Preparar los metadatos
            if ($request->hasFile('audio')) {
                $file = $request->file('audio');
                $extension = $file->getClientOriginalExtension();
                $fileName = 'audio_' . uniqid() . '_' . auth()->id() . '_' . time() . '.' . $extension;
                
                // Asegurarse de que el directorio existe
                Storage::disk('public')->makeDirectory('audio-recordings');
                
                // Intentar guardar el archivo
                $path = $file->storeAs('audio-recordings', $fileName, 'public');
                if ($path) {
                    $metadata['audioUrl'] = asset('storage/' . $path);
                    $metadata['audioFileName'] = $fileName;
                    $metadata['hasAudio'] = true;
                } else {
                    throw new \Exception('Error al guardar el archivo de audio');
                }
            }

            // Crear la entrada con todos los datos
            $entry = JournalEntry::create([
                'user_id' => auth()->id(),
                'mood' => $request->mood,
                'content' => $request->content,
                'metadata' => $metadata
            ]);

            return redirect()->route('journal-entries.index')
                ->with('success', 'Entrada guardada correctamente');
        } catch (\Exception $e) {
            \Log::error('Error al guardar la entrada: ' . $e->getMessage());
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