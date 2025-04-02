import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import '../../../css/journal.css';

export default function Index({ entries }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setIsDarkMode(shouldBeDark);
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    return (
        <>
            <Head title="Mi Diario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="journal-container">
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label="Cambiar tema"
                        >
                            <Expand 
                                toggled={isDarkMode}
                                duration={750}
                                className="theme-toggle-icon"
                            />
                        </button>

                        <div className="journal-paper">
                            <h1 className="journal-title">Mi Diario</h1>
                            
                            <div className="entries-grid">
                                {entries.data.map((entry) => (
                                    <div key={entry.id} className="entry-card">
                                        <div className="entry-header">
                                            <span className="entry-date">
                                                {new Date(entry.created_at).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            {entry.mood && (
                                                <span className={`mood-indicator mood-${entry.mood}`}>
                                                    {entry.mood === 'happy' && '😊'}
                                                    {entry.mood === 'neutral' && '😐'}
                                                    {entry.mood === 'sad' && '😢'}
                                                    {entry.mood === 'angry' && '😠'}
                                                    {entry.mood === 'frustrated' && '😫'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="entry-content">
                                            {entry.content}
                                        </div>
                                        
                                        {entry.metadata?.audio_url && (
                                            <div className="entry-audio">
                                                <audio controls src={entry.metadata.audio_url}>
                                                    Tu navegador no soporta el elemento de audio.
                                                </audio>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link href={route('journal-entries.create')} className="new-entry-button" title="Nueva entrada">
                        ✏️
                    </Link>
                </div>
            </div>
        </>
    );
} 