import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipLoader from 'react-spinners/ClipLoader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function JournalEntryModal({ entry, isOpen, onClose, onDelete, isDeletingId }) {
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

    if (!isOpen || !entry) return null;

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
            default: return '';
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {format(new Date(entry.date), 'EEEE d MMMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        title="Cerrar"
                    >
                        ×
                    </button>
                </div>

                <div className="entries-list">
                    {entry.entries.map((entryItem) => (
                        <div key={entryItem.id} className="entry-item">
                            <div className="entry-header">
                                <div className="entry-info">
                                    <span className="entry-time">
                                        {format(new Date(entryItem.created_at), 'HH:mm')}
                                    </span>
                                    <span className="entry-mood">
                                        {getMoodEmoji(entryItem.mood)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={e => {
                                        if (isDeletingId === null) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDelete(entryItem.id);
                                        }
                                    }}
                                    disabled={isDeletingId === entryItem.id}
                                    className={`journal-button journal-button-primary ${
                                        isDeletingId === entryItem.id ? 'journal-loading' : ''
                                    }`}
                                    title={isDeletingId === entryItem.id ? "Borrando..." : "Borrar entrada"}
                                >
                                    {isDeletingId === entryItem.id ? (
                                        <ClipLoader size={18} color="#e53e3e" />
                                    ) : (
                                        '🗑️'
                                    )}
                                </button>
                            </div>

                            {entryItem.content && (
                                <p className="entry-content">{entryItem.content}</p>
                            )}

                            {entryItem.audio_url && (
                                <div className="entry-audio">
                                    <audio
                                        src={entryItem.audio_url}
                                        controls
                                        className="audio-player"
                                    />
                                    <span className="audio-duration">
                                        Duración: {formatDuration(entryItem.audio_duration)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 