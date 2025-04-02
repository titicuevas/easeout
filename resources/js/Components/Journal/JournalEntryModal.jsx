import React from 'react';

export default function JournalEntryModal({ entry, isOpen, onClose, onDelete }) {
    if (!isOpen || !entry) return null;

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'sad': return '😢';
            case 'angry': return '😠';
            case 'frustrated': return '😫';
            default: return '❓';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {new Date(entry[0].created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body entries-list">
                    {entry.map((entryItem, index) => (
                        <div key={index} className="entry-item">
                            <div className="entry-header">
                                <div className="entry-info">
                                    <span className="entry-time">
                                        {new Date(entryItem.created_at).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <span className="entry-mood" title={entryItem.mood}>
                                        {getMoodEmoji(entryItem.mood)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onDelete(entryItem.id)}
                                    className="delete-button"
                                    title="Borrar entrada"
                                >
                                    🗑️
                                </button>
                            </div>
                            
                            <div className="entry-content">
                                {entryItem.content}
                            </div>
                            
                            {entryItem.metadata?.hasAudio && (
                                <div className="entry-audio">
                                    <audio
                                        controls
                                        className="w-full"
                                        src={entryItem.metadata.audioUrl}
                                    >
                                        Tu navegador no soporta el elemento de audio.
                                    </audio>
                                    {entryItem.metadata.duration > 0 && (
                                        <p className="audio-duration">
                                            {Math.round(entryItem.metadata.duration)}s
                                        </p>
                                    )}
                                </div>
                            )}
                            {index < entry.length - 1 && <hr className="entry-divider" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 