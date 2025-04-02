<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AudioRecording;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

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

        return response()->json($recordings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,m4a|max:10240', // 10MB max
            'mood' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $path = $request->file('audio')->store('audio-recordings', 'public');

        $recording = auth()->user()->audioRecordings()->create([
            'file_path' => $path,
            'duration' => $request->input('duration', 0),
            'mood' => $validated['mood'],
            'metadata' => $validated['metadata']
        ]);

        return response()->json($recording, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(AudioRecording $audioRecording)
    {
        $this->authorize('view', $audioRecording);
        return response()->json($audioRecording);
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

        $audioRecording->update($validated);

        return response()->json($audioRecording);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AudioRecording $audioRecording)
    {
        $this->authorize('delete', $audioRecording);

        // Eliminar el archivo de audio
        Storage::disk('public')->delete($audioRecording->file_path);
        
        $audioRecording->delete();
        return response()->noContent();
    }

    public function download(AudioRecording $audioRecording)
    {
        $this->authorize('view', $audioRecording);
        
        return Storage::disk('public')->download($audioRecording->file_path);
    }
}
