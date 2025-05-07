import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipLoader from 'react-spinners/ClipLoader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function JournalEntryModal({ entries, isOpen, onClose, onDelete, isDeletingId }) {
    const [playingAudio, setPlayingAudio] = useState(null);

    // Animaciones para el overlay y el modal
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 40 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: 40 }
    };

    // Detectar si el tema es oscuro
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (!isOpen || !entries || entries.length === 0) return null;

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'sad': return '😢';
            case 'angry': return '😠';
            case 'frustrated': return '😫';
            case 'in_love': return '❤️';
            case 'heartbroken': return '💔';
            case 'grateful': return '🙏';
            case 'motivated': return '🚀';
            case 'tired': return '😴';
            case 'anxious': return '😰';
            case 'hopeful': return '🌱';
            case 'proud': return '🦁';
            case 'surprised': return '😲';
            case 'inspired': return '💡';
            default: return '❓';
        }
    };

    const getMoodLabel = (mood) => {
        switch (mood) {
            case 'happy': return 'Alegre';
            case 'neutral': return 'Normal';
            case 'sad': return 'Triste';
            case 'angry': return 'Enfadado';
            case 'frustrated': return 'Rallado';
            case 'in_love': return 'Enamorado';
            case 'heartbroken': return 'Desamor';
            case 'grateful': return 'Agradecido';
            case 'motivated': return 'Motivado';
            case 'tired': return 'Cansado';
            case 'anxious': return 'Ansioso';
            case 'hopeful': return 'Esperanzado';
            case 'proud': return 'Orgulloso';
            case 'surprised': return 'Sorprendido';
            case 'inspired': return 'Inspirado';
            default: return 'Desconocido';
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                router.delete(`/journal-entries/${id}`, {
                    onSuccess: () => {
                        onDelete(id);
                        Swal.fire(
                            '¡Borrado!',
                            'La entrada ha sido eliminada.',
                            'success'
                        );
                    },
                    onError: () => {
                        Swal.fire(
                            'Error',
                            'No se pudo borrar la entrada.',
                            'error'
                        );
                    }
                });
            }
        } catch (error) {
            console.error('Error al borrar:', error);
            Swal.fire(
                'Error',
                'No se pudo borrar la entrada.',
                'error'
            );
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} data-theme={isDark ? 'dark' : undefined}>
            <div className="modal-content" onClick={e => e.stopPropagation()} data-theme={isDark ? 'dark' : undefined} style={{ background: isDark ? '#23272f' : undefined, color: isDark ? '#f3f4f6' : undefined }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {entries[0] && entries[0].created_at ? format(new Date(entries[0].created_at), 'EEEE d MMMM yyyy', { locale: es }) : 'Sin fecha'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        title="Cerrar"
                        style={{ color: isDark ? '#fff' : undefined }}
                    >
                        ×
                    </button>
                </div>

                <div className="entries-list">
                    {entries.map((entryItem) => (
                        <div key={entryItem.id} className="entry-item" style={{ background: isDark ? '#23272f' : undefined, color: isDark ? '#f3f4f6' : undefined }}>
                            <div className="entry-header">
                                <div className="entry-info">
                                    <span className="entry-time" style={{ color: isDark ? '#b0b3b8' : undefined }}>
                                        {entryItem.created_at && !isNaN(new Date(entryItem.created_at))
                                            ? new Date(entryItem.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                            : 'Hora desconocida'}
                                    </span>
                                    <span className="entry-mood" title={getMoodLabel(entryItem.mood)} style={{ fontSize: '1.5rem', marginLeft: 8 }}>
                                        {getMoodEmoji(entryItem.mood) || '❓'} <span style={{ fontSize: '1rem', marginLeft: 4 }}>{getMoodLabel(entryItem.mood)}</span>
                                    </span>
                                </div>
                                <button
                                    className="delete-entry"
                                    onClick={() => onDelete(entryItem.id)}
                                    disabled={isDeletingId === entryItem.id}
                                    style={{ background: '#6366f1', color: '#fff', borderRadius: 8, padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
                                >
                                    {isDeletingId === entryItem.id ? (
                                        <ClipLoader size={18} color="#e53e3e" />
                                    ) : (
                                        '🗑️'
                                    )}
                                </button>
                            </div>

                            {entryItem.content && (
                                <p className="entry-content" style={{ color: isDark ? '#f3f4f6' : undefined }}>{entryItem.content}</p>
                            )}

                            {entryItem.metadata && entryItem.metadata.hasAudio && entryItem.metadata.audioUrl && (
                                <div className="entry-audio">
                                    <audio
                                        src={entryItem.metadata.audioUrl}
                                        controls
                                        className="audio-player"
                                    />
                                    <span className="audio-duration" style={{ color: isDark ? '#b0b3b8' : undefined }}>
                                        Duración: {formatDuration(entryItem.metadata.duration)}
                                    </span>
                                </div>
                            )}

                            {(!entryItem.content && !(entryItem.metadata && entryItem.metadata.hasAudio)) && (
                                <p className="entry-content" style={{ color: '#aaa', fontStyle: 'italic' }}>Sin datos</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 