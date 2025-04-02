import React, { useState, useEffect } from 'react';
import '../../../css/journal.css';
import AudioRecorder from './AudioRecorder';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { router } from '@inertiajs/react';

const moods = [
    { emoji: '😊', label: 'Alegre', value: 'happy' },
    { emoji: '😐', label: 'Normal', value: 'neutral' },
    { emoji: '😢', label: 'Triste', value: 'sad' },
    { emoji: '😠', label: 'Enfadado', value: 'angry' },
    { emoji: '😫', label: 'Rallado', value: 'frustrated' }
];

const JournalEntry = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [content, setContent] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioDuration, setAudioDuration] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
        setError(null);
    };

    const handleContentChange = (event) => {
        setContent(event.target.value);
        setError(null);
    };

    const handleRecordingComplete = (blob, duration) => {
        if (blob) {
            setAudioBlob(blob);
            setAudioDuration(duration);
            setError(null);
        } else {
            setAudioBlob(null);
            setAudioDuration(null);
        }
    };

    const handleSave = async () => {
        if (!selectedMood && !content && !audioBlob) {
            setError('Por favor, selecciona un estado de ánimo o añade contenido');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            
            if (selectedMood) {
                formData.append('mood', selectedMood.value);
            }
            
            if (content) {
                formData.append('content', content);
            }

            // Metadata como objeto JSON
            const metadata = {
                timestamp: new Date().toISOString(),
                hasAudio: !!audioBlob,
                duration: audioBlob ? Math.round(audioDuration) : 0
            };

            formData.append('metadata', JSON.stringify(metadata));

            if (audioBlob) {
                formData.append('audio', audioBlob, 'audio-recording.mp3');
            }

            await router.post(route('journal-entries.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    window.location.href = route('journal-entries.index');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    setError(Object.values(errors)[0] || 'Error al guardar la entrada');
                }
            });
        } catch (error) {
            console.error('Error al procesar la entrada:', error);
            setError('Error al procesar la entrada. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="journal-container">
            <div
                onClick={toggleTheme}
                className="theme-toggle"
                role="button"
                tabIndex={0}
                aria-label="Cambiar tema"
            >
                <Expand 
                    toggled={isDarkMode}
                    duration={750}
                    className="theme-toggle-icon"
                />
            </div>
            <div className="journal-paper">
                <h1 className="journal-title">¿Cómo te sientes hoy?</h1>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="my-6">
                    <div className="flex justify-center flex-wrap gap-2">
                        {moods.map((mood) => (
                            <button
                                key={mood.value}
                                className={`mood-button mood-${mood.value} ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                                onClick={() => handleMoodSelect(mood)}
                            >
                                <span className="emoji">{mood.emoji}</span>
                                <span className="label">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="my-6">
                    <h2 className="journal-subtitle">
                        ¿Qué quieres compartir?
                    </h2>
                    <div className="journal-textarea">
                        <textarea
                            rows={6}
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Escribe lo que sientes..."
                        />
                    </div>
                </div>

                <div className="my-6">
                    <h2 className="journal-subtitle">
                        O graba un mensaje de voz
                    </h2>
                    <AudioRecorder 
                        onRecordingComplete={handleRecordingComplete} 
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={isSaving || (!selectedMood && !content && !audioBlob)}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar entrada'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry; 