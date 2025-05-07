import React, { useState, useEffect } from 'react';
import '../../../css/journal.css';
import AudioRecorder from './AudioRecorder';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import ClipLoader from 'react-spinners/ClipLoader';
import Calendar from './Calendar';

const moods = [
    { emoji: '😊', label: 'Alegre', value: 'happy' },
    { emoji: '😐', label: 'Normal', value: 'neutral' },
    { emoji: '😢', label: 'Triste', value: 'sad' },
    { emoji: '😠', label: 'Enfadado', value: 'angry' },
    { emoji: '😫', label: 'Rallado', value: 'frustrated' },
    { emoji: '❤️', label: 'Enamorado', value: 'in_love' },
    { emoji: '💔', label: 'Desamor', value: 'heartbroken' },
    { emoji: '🙏', label: 'Agradecido', value: 'grateful' },
    { emoji: '🚀', label: 'Motivado', value: 'motivated' },
    { emoji: '😴', label: 'Cansado', value: 'tired' },
    { emoji: '😰', label: 'Ansioso', value: 'anxious' },
    { emoji: '🌱', label: 'Esperanzado', value: 'hopeful' },
    { emoji: '🦁', label: 'Orgulloso', value: 'proud' },
    { emoji: '😲', label: 'Sorprendido', value: 'surprised' },
    { emoji: '💡', label: 'Inspirado', value: 'inspired' },
];

const JournalEntry = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [content, setContent] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioDuration, setAudioDuration] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [entries, setEntries] = useState([]);

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
        NProgress.start();

        if (!selectedMood && !content && !audioBlob) {
            setError('Por favor, selecciona un estado de ánimo, escribe algo o graba un audio.');
            setIsSaving(false);
            NProgress.done();
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
                    NProgress.done();
                },
                onSuccess: () => {
                    setContent('');
                    setSelectedMood(null);
                    setAudioBlob(null);
                    setAudioDuration(0);
                    router.reload({ only: ['entries'], preserveScroll: true, preserveState: true });
                    Swal.fire({
                        icon: 'success',
                        title: '¡Guardado!',
                        text: 'Tu entrada se ha guardado correctamente.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    setIsSaving(false);
                    NProgress.done();
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
            NProgress.done();
        }
    };

    const handleEntryClick = (entry) => {
        // Implementa la lógica para manejar el clic en una entrada
        console.log('Entrada seleccionada:', entry);
    };

    return (
        <div className="journal-container">
            <div className="journal-content">
                {/* Header */}
                <div className="journal-header">
                    <h1 className="journal-title">Mi Diario</h1>
                    <p className="journal-subtitle">Comparte tus pensamientos y emociones del día</p>
                </div>

                {/* Main Content */}
                <div className="journal-grid">
                    {/* Left Column - Form */}
                    <div className="journal-form">
                        {/* Mood Selection */}
                        <div className="journal-card">
                            <h2 className="journal-card-title">¿Cómo te sientes hoy?</h2>
                            <div className="mood-grid">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.value}
                                        onClick={() => setSelectedMood(mood.value)}
                                        className={`mood-button ${selectedMood === mood.value ? 'selected' : ''}`}
                                        title={mood.label}
                                    >
                                        <span className="mood-emoji">{mood.emoji}</span>
                                        <span className="mood-label">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Input */}
                        <div className="journal-card">
                            <h2 className="journal-card-title">Escribe tus pensamientos</h2>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="¿Qué te gustaría compartir hoy?"
                                className="journal-textarea"
                            />
                        </div>

                        {/* Audio Recorder */}
                        <div className="journal-card">
                            <h2 className="journal-card-title">Graba un mensaje de voz</h2>
                            <AudioRecorder
                                onAudioSave={handleRecordingComplete}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving || (!selectedMood && !content && !audioBlob)}
                                className={`journal-button journal-button-primary ${
                                    isSaving || (!selectedMood && !content && !audioBlob) ? 'journal-loading' : ''
                                }`}
                                title={isSaving ? 'Guardando...' : 'Guardar entrada'}
                            >
                                {isSaving ? (
                                    <>
                                        <ClipLoader size={20} color="#fff" className="mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry; 