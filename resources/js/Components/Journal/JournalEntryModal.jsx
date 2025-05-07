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

    const handleDeleteClick = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: () => onDelete(id),
            allowOutsideClick: () => !Swal.isLoading()
        });
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
                                    onClick={() => handleDeleteClick(entryItem.id)}
                                    disabled={isDeletingId !== null}
                                    style={{ background: '#e53e3e', color: '#fff', borderRadius: 8, padding: '0.5rem 1rem', border: 'none', cursor: isDeletingId !== null ? 'not-allowed' : 'pointer' }}
                                >
                                    {isDeletingId === entryItem.id ? (
                                        <ClipLoader size={18} color="#fff" />
                                    ) : (
                                        '🗑️'
                                    )}
                                </button>
                            </div>

                            {entryItem.content && entryItem.content.trim() !== '' && (
                                <p className="entry-content" style={{ color: isDark ? '#f3f4f6' : undefined }}>{entryItem.content}</p>
                            )}

                            {entryItem.metadata && (entryItem.metadata.audioUrl || entryItem.metadata.audio_url) && (
                                <div className="entry-audio" style={{ background: isDark ? '#181a20' : '#f8fafc', borderRadius: 12, padding: 16, margin: '12px 0', boxShadow: isDark ? '0 2px 8px #0004' : '0 2px 8px #0001' }}>
                                    <audio
                                        src={entryItem.metadata.audioUrl || entryItem.metadata.audio_url}
                                        controls
                                        className="audio-player"
                                        style={{ width: '100%', borderRadius: 8, background: isDark ? '#23272f' : '#fff' }}
                                    />
                                    <span className="audio-duration" style={{ color: isDark ? '#b0b3b8' : '#4b5563', float: 'right', fontSize: 14 }}>
                                        Duración: {formatDuration(entryItem.metadata.duration || entryItem.metadata.audio_duration || 0)}
                                    </span>
                                </div>
                            )}

                            {(!entryItem.content || entryItem.content.trim() === '') && !(entryItem.metadata && (entryItem.metadata.audioUrl || entryItem.metadata.audio_url)) && (
                                <p className="entry-content" style={{ color: '#aaa', fontStyle: 'italic' }}>Sin datos</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isDeletingId !== null && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.25)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ background: '#23272f', color: '#fff', padding: 32, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ClipLoader size={32} color="#fff" />
                        <span style={{ marginTop: 16 }}>Borrando entrada...</span>
                    </div>
                </div>
            )}
        </div>
    );
} 