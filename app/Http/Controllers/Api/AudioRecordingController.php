<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AudioRecording;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AudioRecordingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $recordings = auth()->user()->audioRecordings()
            ->latest()
            ->paginate(10);

        return Inertia::render('AudioRecordings/Index', [
            'recordings' => $recordings
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('AudioRecordings/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,m4a|max:10240', // 10MB max
            'duration' => 'required|integer',
            'mood' => 'nullable|string',
            'metadata' => 'nullable|array'
        ], [
            'audio.required' => 'El archivo de audio es requerido',
            'audio.file' => 'El archivo de audio no es válido',
            'audio.mimes' => 'El formato del archivo de audio no es válido. Formatos permitidos: mp3, wav, m4a',
            'audio.max' => 'El archivo de audio no puede ser mayor a 10MB',
            'duration.required' => 'La duración es requerida',
            'duration.integer' => 'La duración debe ser un número entero',
            'mood.string' => 'El estado de ánimo debe ser texto',
            'metadata.array' => 'El formato de los metadatos no es válido'
        ]);

        // Guardar el archivo de audio
        $audioPath = $request->file('audio')->store('audios', 'public');

        // Crear el registro en la base de datos
        $recording = auth()->user()->audioRecordings()->create([
            'file_path' => $audioPath,
            'duration' => $validated['duration'],
            'mood' => $validated['mood'] ?? null,
            'metadata' => $validated['metadata'] ?? null
        ]);

        return redirect()->route('audio-recordings.index')
            ->with('message', 'Grabación guardada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(AudioRecording $audioRecording)
    {
        $this->authorize('view', $audioRecording);

        return Inertia::render('AudioRecordings/Show', [
            'recording' => $audioRecording,
            'audioUrl' => Storage::disk('public')->url($audioRecording->file_path)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AudioRecording $audioRecording)
    {
        $this->authorize('update', $audioRecording);

        return Inertia::render('AudioRecordings/Edit', [
            'recording' => $audioRecording,
            'audioUrl' => Storage::disk('public')->url($audioRecording->file_path)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AudioRecording $audioRecording)
    {
        $this->authorize('update', $audioRecording);

        $validated = $request->validate([
            'mood' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        // Si hay un nuevo archivo de audio
        if ($request->hasFile('audio')) {
            $request->validate([
                'audio' => 'required|file|mimes:mp3,wav,m4a|max:10240',
                'duration' => 'required|integer'
            ]);

            // Eliminar el archivo anterior
            Storage::disk('public')->delete($audioRecording->file_path);

            // Guardar el nuevo archivo
            $audioPath = $request->file('audio')->store('audios', 'public');
            $validated['file_path'] = $audioPath;
            $validated['duration'] = $request->input('duration');
        }

        $audioRecording->update($validated);

        return redirect()->route('audio-recordings.index')
            ->with('message', 'Grabación actualizada exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AudioRecording $audioRecording)
    {
        $this->authorize('delete', $audioRecording);

        // Eliminar el archivo físico
        Storage::disk('public')->delete($audioRecording->file_path);
        
        // Eliminar el registro de la base de datos
        $audioRecording->delete();

        return redirect()->route('audio-recordings.index')
            ->with('message', 'Grabación eliminada exitosamente');
    }

    public function download(AudioRecording $audioRecording)
    {
        $this->authorize('view', $audioRecording);

        return Storage::disk('public')->download(
            $audioRecording->file_path,
            'audio-' . $audioRecording->created_at->format('Y-m-d-H-i-s') . '.mp3'
        );
    }
}
