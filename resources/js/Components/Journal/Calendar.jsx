import React, { useState } from 'react';

export default function Calendar({ entries, onEntryClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodFilter, setMoodFilter] = useState(null);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [disabled, setDisabled] = useState(false);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        // Convertir domingo (0) a 7 para que la semana empiece en lunes (1)
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const getEntriesForDate = (date) => {
        let filteredEntries = entries.data.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return entryDate.toDateString() === date.toDateString();
        });

        if (moodFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.mood === moodFilter);
        }

        return filteredEntries;
    };

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

    const getMoodLabel = (mood) => {
        switch (mood) {
            case 'happy': return 'Feliz';
            case 'neutral': return 'Neutral';
            case 'sad': return 'Triste';
            case 'angry': return 'Enojado';
            case 'frustrated': return 'Frustrado';
            default: return 'Desconocido';
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Agregar días vacíos al principio
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const entriesForDay = getEntriesForDate(date);
            const hasEntries = entriesForDay.length > 0;

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${hasEntries ? 'has-entries' : ''}`}
                    onClick={() => hasEntries && !disabled && onEntryClick(entriesForDay)}
                    style={{ cursor: hasEntries && !disabled ? 'pointer' : 'default' }}
                >
                    <span className="day-number">{day}</span>
                    {hasEntries && (
                        <div className="entries-preview">
                            {entriesForDay.map((entry, index) => (
                                <span 
                                    key={index}
                                    className={`entry-emoji mood-${entry.mood} ${disabled ? 'opacity-50' : ''}`}
                                    title={`${getMoodLabel(entry.mood)} - ${new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                >
                                    {getMoodEmoji(entry.mood)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const renderEntryDetails = (entry) => {
        return (
            <div className="entry-details">
                <div className="entry-time">
                    {new Date(entry.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <div className="entry-mood" title={getMoodLabel(entry.mood)}>
                    {getMoodEmoji(entry.mood)}
                </div>
                {entry.content && (
                    <div className="entry-content">
                        {entry.content}
                    </div>
                )}
                {entry.metadata?.hasAudio && (
                    <div className="entry-audio">
                        <audio
                            controls
                            src={entry.metadata.audioUrl}
                            onPlay={() => {
                                // Pausar cualquier otro audio que esté reproduciéndose
                                if (playingAudio && playingAudio !== entry.id) {
                                    const previousAudio = document.querySelector(`audio[data-entry-id="${playingAudio}"]`);
                                    if (previousAudio) previousAudio.pause();
                                }
                                setPlayingAudio(entry.id);
                            }}
                            onEnded={() => setPlayingAudio(null)}
                            onPause={() => setPlayingAudio(null)}
                            className="w-full"
                            data-entry-id={entry.id}
                        >
                            Tu navegador no soporta el elemento de audio.
                        </audio>
                        {entry.metadata.duration > 0 && (
                            <span className="audio-duration">
                                {formatDuration(entry.metadata.duration)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment));
    };

    const moods = ['happy', 'neutral', 'sad', 'angry', 'frustrated'];

    return (
        <div className="calendar-container p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="calendar-filters mb-6">
                <div className="mood-filters flex flex-wrap gap-2 justify-center">
                    <button 
                        className={`mood-filter px-4 py-2 rounded-full text-sm sm:text-base ${!moodFilter ? 'active' : ''}`}
                        onClick={() => setMoodFilter(null)}
                    >
                        Todos
                    </button>
                    {moods.map(mood => (
                        <button
                            key={mood}
                            className={`mood-filter px-4 py-2 rounded-full text-sm sm:text-base ${moodFilter === mood ? 'active' : ''}`}
                            onClick={() => setMoodFilter(mood)}
                            title={getMoodLabel(mood)}
                        >
                            {getMoodEmoji(mood)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calendar-header flex items-center justify-between mb-6">
                <button 
                    onClick={() => changeMonth(-1)}
                    className="calendar-nav-button p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="Mes anterior"
                >
                    ←
                </button>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(' de ', ' ')}
                </h2>
                <button 
                    onClick={() => changeMonth(1)}
                    className="calendar-nav-button p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="Mes siguiente"
                >
                    →
                </button>
            </div>
            <div className="calendar-weekdays grid grid-cols-7 gap-1 mb-2 text-sm sm:text-base font-medium">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
            </div>
            <div className="calendar-grid grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>
        </div>
    );
} 