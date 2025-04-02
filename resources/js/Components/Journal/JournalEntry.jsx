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
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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
            // Verificar que el blob es un archivo de audio válido
            if (blob instanceof File && blob.type === 'audio/webm') {
                setAudioBlob(blob);
                setAudioDuration(duration);
                setError(null);
            } else {
                setError('El formato de audio no es válido. Por favor, inténtalo de nuevo.');
                setAudioBlob(null);
                setAudioDuration(null);
            }
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

            // Preparar los metadatos como un objeto
            const metadata = {
                timestamp: new Date().toISOString(),
                hasAudio: !!audioBlob,
                duration: audioDuration || 0
            };

            // Añadir los metadatos como un objeto JSON
            formData.append('metadata', JSON.stringify(metadata));

            if (audioBlob) {
                // Verificar que el archivo de audio es válido
                if (!(audioBlob instanceof File) || audioBlob.type !== 'audio/webm') {
                    throw new Error('El formato de audio no es válido');
                }
                formData.append('audio', audioBlob);
            }

            await router.post(route('journal-entries.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    window.location.href = route('journal-entries.index');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    setError(Object.values(errors)[0] || 'Error al guardar la entrada');
                    setIsSaving(false);
                }
            });
        } catch (error) {
            console.error('Error al procesar la entrada:', error);
            setError('Error al procesar la entrada. Por favor, inténtalo de nuevo.');
            setIsSaving(false);
        }
    };

    return (
        <div className="journal-container min-h-screen p-4 md:p-6 lg:p-8">
            <div className="journal-paper max-w-4xl mx-auto">
                <h1 className="journal-title text-2xl md:text-3xl lg:text-4xl mb-6">¿Cómo te sientes hoy?</h1>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="mood-section mb-8">
                    <div className="mood-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                        {moods.map((mood) => (
                            <button
                                key={mood.value}
                                className={`mood-button mood-${mood.value} ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                                onClick={() => handleMoodSelect(mood)}
                                title={mood.label}
                            >
                                <span className="emoji text-2xl md:text-3xl">{mood.emoji}</span>
                                <span className="label text-sm md:text-base">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="content-section mb-8">
                    <h2 className="section-title text-xl md:text-2xl mb-4">
                        ¿Qué quieres compartir?
                    </h2>
                    <div className="textarea-wrapper">
                        <textarea
                            rows={6}
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Escribe lo que sientes..."
                            className="content-textarea p-4 text-base md:text-lg"
                        />
                    </div>
                </div>

                <div className="audio-section mb-8">
                    <h2 className="section-title text-xl md:text-2xl mb-4">
                        O graba un mensaje de voz
                    </h2>
                    <AudioRecorder 
                        onRecordingComplete={handleRecordingComplete} 
                    />
                </div>

                <div className="actions-section flex justify-end">
                    <button
                        className="save-button px-6 py-3 md:px-8 md:py-3 text-base md:text-lg"
                        onClick={handleSave}
                        disabled={isSaving || (!selectedMood && !content && !audioBlob)}
                    >
                        {isSaving ? (
                            <span className="saving-indicator">
                                <span className="saving-dot"></span>
                                <span className="saving-dot"></span>
                                <span className="saving-dot"></span>
                            </span>
                        ) : (
                            'Guardar entrada'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry; 