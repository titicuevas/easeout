import React, { useState, useEffect } from 'react';
import '../../../css/journal.css';
import AudioRecorder from './AudioRecorder';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

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

    const handleMoodSelect = (mood, e) => {
        if (e) e.preventDefault();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        setIsSaving(true);

        if (!selectedMood && !content && !audioBlob) {
            setError('Por favor, selecciona un estado de ánimo, escribe algo o graba un audio.');
            setIsSaving(false);
            return;
        }

        try {
            setError(null);
            const formData = new FormData();
            
            if (selectedMood) {
                console.log('Mood enviado:', selectedMood);
                formData.append('mood', selectedMood.value);
            }
            
            if (content) {
                formData.append('content', content);
            }
            
            if (audioBlob) {
                formData.append('audio', audioBlob);
                formData.append('audioDuration', audioDuration);
            }

            // Preparar los metadatos
            const metadata = {
                timestamp: new Date().toISOString(),
                hasAudio: !!audioBlob,
                duration: audioDuration || 0
            };

            formData.append('metadata', JSON.stringify(metadata));

            await router.post(route('journal-entries.store'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Error al guardar:', errors);
                    setError(Object.values(errors).join(', '));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al guardar la entrada. Por favor, inténtalo de nuevo.',
                    });
                    setIsSaving(false);
                },
                onSuccess: () => {
                    setContent('');
                    setSelectedMood(null);
                    setAudioBlob(null);
                    setAudioDuration(0);
                    router.visit(route('journal-entries.index'), {
                        preserveScroll: true
                    });
                    Swal.fire({
                        icon: 'success',
                        title: '¡Guardado!',
                        text: 'Tu entrada se ha guardado correctamente.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    setIsSaving(false);
                },
            });
        } catch (error) {
            console.error('Error al guardar:', error);
            setError('Error al guardar la entrada: ' + error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al guardar la entrada. Por favor, inténtalo de nuevo.',
            });
            setIsSaving(false);
        }
    };

    return (
        <div className="journal-container min-h-screen p-4 md:p-6 lg:p-8">
            <div className="journal-paper max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
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
                                    onClick={(e) => handleMoodSelect(mood, e)}
                                    title={mood.label}
                                    type="button"
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
                            disabled={isSaving}
                        />
                    </div>

                    <div className="actions-section flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving || (!selectedMood && !content && !audioBlob)}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                                ${isSaving || (!selectedMood && !content && !audioBlob)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                            title={isSaving ? 'Guardando...' : 'Guardar entrada'}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JournalEntry; 