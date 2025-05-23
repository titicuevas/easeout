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
import JournalEntryModal from './JournalEntryModal';

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
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDayEntries, setSelectedDayEntries] = useState([]);
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

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
                formData.append('mood', selectedMood);
            }
            
            if (content) {
                formData.append('content', content);
            }
            
            if (audioBlob) {
                formData.append('audio', audioBlob);
                formData.append('audioDuration', audioDuration);
            }

            formData.append('entry_date', entryDate);

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

    const handleEntryClick = (entries) => {
        if (Array.isArray(entries) && entries.length > 0) {
            setSelectedDayEntries(entries);
            setModalOpen(true);
        } else {
            setSelectedDayEntries([]);
            setModalOpen(false);
        }
    };

    const handleDelete = async (entryId) => {
        try {
            await router.delete(route('journal-entries.destroy', entryId), {
                onSuccess: () => {
                    setModalOpen(false);
                    setSelectedDayEntries([]);
                    router.reload({ only: ['entries'] });
                    Swal.fire({
                        icon: 'success',
                        title: '¡Borrado!',
                        text: 'La entrada ha sido eliminada.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar la entrada.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                },
                preserveScroll: true
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la entrada.',
            });
        }
    };

    return (
        <div className="journal-container flex justify-center items-start min-h-screen">
            <div className="journal-content w-full max-w-xl">
                {/* Header */}
                <div className="journal-header">
                    <h1 className="journal-title">Mi Diario</h1>
                    <p className="journal-subtitle">Comparte tus pensamientos y emociones del día</p>
                </div>

                {/* Main Content */}
                <form className="journal-form space-y-6" onSubmit={handleSubmit}>
                    {/* Mood Selection */}
                    <div className="journal-card">
                        <h2 className="journal-card-title">¿Cómo te sientes hoy?</h2>
                        <div className="mood-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                            {moods.map((mood) => (
                                <button
                                    key={mood.value}
                                    type="button"
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`mood-button mood-${mood.value} ${selectedMood === mood.value ? 'selected' : ''}`}
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
                        <div className="mb-4">
                            <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha de la entrada
                            </label>
                            <input
                                type="date"
                                id="entry-date"
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <textarea
                            value={content}
                            onChange={handleContentChange}
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

                    {/* Error Message */}
                    {error && (
                        <div className="journal-card journal-error bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isSaving || (!selectedMood && !content && !audioBlob)}
                            className={`journal-button journal-button-primary ${isSaving ? 'journal-loading text-left' : ''}`}
                            title={isSaving ? 'Guardando...' : 'Guardar entrada'}
                            style={{ minWidth: 110 }}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
            <JournalEntryModal
                entries={selectedDayEntries}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onDelete={handleDelete}
                isDeletingId={null}
            />
        </div>
    );
};

export default JournalEntry; 