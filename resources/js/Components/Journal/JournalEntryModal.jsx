import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipLoader from 'react-spinners/ClipLoader';

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
        <AnimatePresence>
            {isOpen && entry && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    key="modal-overlay"
                >
                    <motion.div
                        className="w-full max-w-2xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        tabIndex={-1}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        key="modal-content"
                    >
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white line-clamp-1">
                                {new Date(entry[0].created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-4rem)]">
                            {entry.map((entryItem, index) => (
                                <div key={index} className="mb-4 sm:mb-6 last:mb-0">
                                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                                {new Date(entryItem.created_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-xl sm:text-2xl" title={entryItem.mood}>
                                                {getMoodEmoji(entryItem.mood) || '❓'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={e => {
                                                if (isDeletingId === null) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onDelete(entryItem.id); // Aquí se debe actualizar isDeletingId
                                                }
                                            }}
                                            disabled={isDeletingId === entryItem.id}
                                            className={`p-1.5 sm:p-2 rounded-full transition-colors ${isDeletingId === entryItem.id
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                    : 'hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                                                }`}
                                            title={isDeletingId === entryItem.id ? "Borrando..." : "Borrar entrada"}
                                            tabIndex={isDeletingId === entryItem.id ? -1 : 0}
                                            aria-disabled={isDeletingId === entryItem.id}
                                        >
                                            {isDeletingId === entryItem.id ? <ClipLoader size={18} color="#e53e3e" /> : '🗑️'}
                                        </button>
                                    </div>

                                    <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                                        {entryItem.content}
                                    </div>

                                    {entryItem.metadata?.hasAudio && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                            <div className="flex flex-col gap-2">
                                                <audio
                                                    controls
                                                    className="w-full"
                                                    src={entryItem.metadata.audioUrl}
                                                    data-entry-id={entryItem.id}
                                                    onPlay={(e) => {
                                                        document.querySelectorAll('audio').forEach(audio => {
                                                            if (audio !== e.target) audio.pause();
                                                        });
                                                        setPlayingAudio(entryItem.id);
                                                    }}
                                                    onEnded={() => setPlayingAudio(null)}
                                                    onPause={() => setPlayingAudio(null)}
                                                    onError={(e) => {
                                                        console.error('Error al reproducir audio:', e);
                                                        Swal.fire({
                                                            title: 'Error',
                                                            text: 'No se pudo reproducir el audio. Por favor, intenta recargar la página.',
                                                            icon: 'error'
                                                        });
                                                    }}
                                                >
                                                    Tu navegador no soporta el elemento de audio.
                                                </audio>
                                                {entryItem.metadata.duration > 0 && (
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
                                                        Duración: {formatDuration(entryItem.metadata.duration)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {index < entry.length - 1 && (
                                        <hr className="my-4 sm:my-6 border-gray-200 dark:border-gray-700" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 