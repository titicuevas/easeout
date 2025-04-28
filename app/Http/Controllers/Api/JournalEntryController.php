<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class JournalEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $entries = auth()->user()->journalEntries()
            ->with('tags')
            ->latest()
            ->paginate(10);

        return response()->json($entries);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'nullable|string',
            'mood' => 'nullable|string',
            'metadata' => 'required|array',
            'metadata.timestamp' => 'required|string',
            'metadata.hasAudio' => 'required|boolean',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a',
            'duration' => 'nullable|integer'
        ], [
            'metadata.required' => 'Los metadatos son requeridos',
            'metadata.array' => 'El formato de los metadatos no es válido',
            'metadata.timestamp.required' => 'La marca de tiempo es requerida',
            'metadata.timestamp.string' => 'El formato de la marca de tiempo no es válido',
            'metadata.hasAudio.required' => 'El campo hasAudio es requerido',
            'metadata.hasAudio.boolean' => 'El campo hasAudio debe ser verdadero o falso',
            'audio.file' => 'El archivo de audio no es válido',
            'audio.mimes' => 'El formato del archivo de audio no es válido. Formatos permitidos: mp3, wav, m4a',
            'duration.integer' => 'La duración debe ser un número entero'
        ]);

        $entry = auth()->user()->journalEntries()->create([
            'content' => $validated['content'],
            'mood' => $validated['mood'],
            'metadata' => $validated['metadata']
        ]);

        if ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('audio-recordings', 'public');
            $validated['metadata']['audio_url'] = asset('storage/' . $path);
            $entry->update(['metadata' => $validated['metadata']]);
        }

        return response()->json($entry, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(JournalEntry $journalEntry)
    {
        $this->authorize('view', $journalEntry);
        return response()->json($journalEntry->load('tags'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JournalEntry $journalEntry)
    {
        $this->authorize('update', $journalEntry);

        $validated = $request->validate([
            'content' => 'sometimes|required|string',
            'mood' => 'nullable|string',
            'metadata' => 'nullable|array',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id'
        ]);

        $journalEntry->update([
            'content' => $validated['content'] ?? $journalEntry->content,
            'mood' => $validated['mood'],
            'metadata' => $validated['metadata']
        ]);

        if (isset($validated['tags'])) {
            $journalEntry->tags()->sync($validated['tags']);
        }

        return response()->json($journalEntry->load('tags'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JournalEntry $journalEntry)
    {
        $this->authorize('delete', $journalEntry);
        
        $journalEntry->delete();
        return response()->noContent();
    }
}
