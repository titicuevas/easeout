<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class JournalEntryController extends Controller
{
    public function index()
    {
        $entries = JournalEntry::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($entry) {
                $metadata = $entry->metadata;
                if (isset($metadata['audioUrl'])) {
                    // Generar URL firmada temporal (válida por 1 hora)
                    $metadata['audioUrl'] = Storage::disk('s3')->temporaryUrl(
                        $metadata['audioUrl'],
                        now()->addHour()
                    );
                }
                return [
                    'id' => $entry->id,
                    'content' => $entry->content,
                    'metadata' => $metadata,
                    'created_at' => $entry->created_at,
                    'updated_at' => $entry->updated_at,
                ];
            });

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
        \Log::info('Datos recibidos:', [
            'mood' => $request->mood,
            'content' => $request->content,
            'metadata' => $request->metadata,
            'has_audio' => $request->hasFile('audio'),
            'audio_mime' => $request->hasFile('audio') ? $request->file('audio')->getMimeType() : null
        ]);

        try {
            $request->validate([
                'mood' => 'required_without_all:content,audio|string',
                'content' => 'nullable|string',
                'audio' => 'nullable|file|mimes:webm,mp3,wav,m4a,mpeg,ogg|max:20480' // 20MB max
            ]);

            DB::beginTransaction();

            $metadata = json_decode($request->metadata ?? '{}', true) ?: [];
            $metadata['timestamp'] = $metadata['timestamp'] ?? now()->toISOString();
            $metadata['hasAudio'] = false;

            if ($request->hasFile('audio')) {
                $file = $request->file('audio');
                $fileName = uniqid() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('audio-recordings', $fileName, config('filesystems.default'));
                
                $metadata['hasAudio'] = true;
                $metadata['audioFileName'] = $fileName;
                $metadata['audioUrl'] = 'audio-recordings/' . $fileName;
                $metadata['audioMimeType'] = $file->getMimeType();
                $metadata['audioSize'] = $file->getSize();
                $metadata['duration'] = $metadata['duration'] ?? 0;

                \Log::info('Audio guardado:', [
                    'path' => $path,
                    'url' => $metadata['audioUrl'],
                    'size' => $metadata['audioSize'],
                    'mime' => $metadata['audioMimeType'],
                    'disk' => config('filesystems.default')
                ]);
            }

            // Crear la entrada
            $entry = new JournalEntry();
            $entry->user_id = auth()->id();
            $entry->mood = in_array($request->input('mood'), ['happy', 'neutral', 'sad', 'angry', 'frustrated']) ? $request->input('mood') : null;
            $entry->content = $request->input('content');
            $entry->metadata = $metadata;
            $entry->save();

            DB::commit();

            \Log::info('Entrada guardada:', $entry->toArray());

            return redirect()->route('journal-entries.index')
                ->with('success', 'Entrada guardada correctamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            if (isset($path)) {
                Storage::disk(config('filesystems.default'))->delete($path);
            }
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Si hubo error y se subió un archivo, intentar eliminarlo
            if (isset($path)) {
                Storage::disk(config('filesystems.default'))->delete($path);
            }

            \Log::error('Error al guardar la entrada:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
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
            // Eliminar el archivo de audio si existe
            if (isset($journalEntry->metadata['audioFileName'])) {
                Storage::disk(config('filesystems.default'))->delete('audio-recordings/' . $journalEntry->metadata['audioFileName']);
            }

            $journalEntry->delete();

            return redirect()->route('journal-entries.index')
                ->with('success', 'Entrada eliminada correctamente');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al eliminar la entrada: ' . $e->getMessage()]);
        }
    }

    
    public function show(JournalEntry $journalEntry)
    {
        if ($journalEntry->user_id !== auth()->id()) {
            abort(403);
        }

        $metadata = $journalEntry->metadata;
        if (isset($metadata['audioUrl'])) {
            // Generar URL firmada temporal (válida por 1 hora)
            $metadata['audioUrl'] = Storage::disk('s3')->temporaryUrl(
                $metadata['audioUrl'],
                now()->addHour()
            );
        }

        return response()->json([
            'id' => $journalEntry->id,
            'content' => $journalEntry->content,
            'metadata' => $metadata,
            'created_at' => $journalEntry->created_at,
            'updated_at' => $journalEntry->updated_at,
        ]);
    }
} 