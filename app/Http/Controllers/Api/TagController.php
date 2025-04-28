<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tags = auth()->user()->tags()
            ->withCount('journalEntries')
            ->latest()
            ->get();

        return Inertia::render('Tags/Index', [
            'tags' => $tags
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tags/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7'
        ]);

        $tag = auth()->user()->tags()->create($validated);

        return redirect()->route('tags.index')
            ->with('message', 'Etiqueta creada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        $this->authorize('view', $tag);
        
        return Inertia::render('Tags/Show', [
            'tag' => $tag->load('journalEntries')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag)
    {
        $this->authorize('update', $tag);
        
        return Inertia::render('Tags/Edit', [
            'tag' => $tag
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => 'nullable|string|max:7'
        ]);

        $tag->update($validated);

        return redirect()->route('tags.index')
            ->with('message', 'Etiqueta actualizada exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        $this->authorize('delete', $tag);
        
        $tag->delete();
        
        return redirect()->route('tags.index')
            ->with('message', 'Etiqueta eliminada exitosamente');
    }
}
