import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
        let filteredEntries = entries.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return entryDate.toDateString() === date.toDateString();
        });

        if (moodFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.mood === moodFilter);
        }

        return filteredEntries;
    };

    const moodMap = {
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        angry: '😠',
        frustrated: '😫',
        in_love: '❤️',
        heartbroken: '💔',
        grateful: '🙏',
        motivated: '🚀',
        tired: '😴',
        anxious: '��',
        hopeful: '🌱',
        proud: '🦁',
        surprised: '😲',
        inspired: '💡',
    };

    const getMoodEmoji = (mood) => {
        if (!mood) return '❓';
        // Normalizar guiones y minúsculas
        const key = mood.replace(/-/g, '_').toLowerCase();
        return moodMap[key] || mood || '❓';
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
            default:
                return typeof mood === 'string' ? mood : 'Desconocido';
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
                    onClick={() => !disabled && onEntryClick(entriesForDay)}
                    style={{ cursor: hasEntries && !disabled ? 'pointer' : 'default' }}
                >
                    <span className="day-number">{day}</span>
                    {hasEntries && (
                        <div className="entries-preview" style={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 28, overflow: 'hidden', alignItems: 'center' }}>
                            {entriesForDay.slice(0, 4).map((entry, index) => (
                                <span
                                    key={index}
                                    className={`entry-emoji mood-${entry.mood} ${disabled ? 'opacity-50' : ''} calendar-emoji-enhanced`}
                                    title={`${getMoodLabel(entry.mood)}${!isNaN(new Date(entry.created_at)) && entry.created_at ? ' - ' + (new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })) : ''}`}
                                >
                                    {getMoodEmoji(entry.mood)}
                                </span>
                            ))}
                            {entriesForDay.length > 4 && (
                                <span className="entry-emoji" title={`+${entriesForDay.length - 4} más`}>+{entriesForDay.length - 4}</span>
                            )}
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
                    {entry.created_at && !isNaN(new Date(entry.created_at)) ?
                        new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) :
                        'Hora desconocida'}
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

    const moods = [
        'happy', 'neutral', 'sad', 'angry', 'frustrated',
        'in_love', 'heartbroken', 'grateful', 'motivated', 'tired',
        'anxious', 'hopeful', 'proud', 'surprised', 'inspired'
    ];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button
                    onClick={() => changeMonth(-1)}
                    className="calendar-nav-button"
                    title="Mes anterior"
                >
                    <FaChevronLeft />
                </button>
                <h2>{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
                <button
                    onClick={() => changeMonth(1)}
                    className="calendar-nav-button"
                    title="Mes siguiente"
                >
                    <FaChevronRight />
                </button>
            </div>

            <div className="calendar-filters">
                <div className="mood-filters">
                    <button 
                        className={`mood-filter ${!moodFilter ? 'active' : ''}`}
                        onClick={() => setMoodFilter(null)}
                    >
                        Todos
                    </button>
                    {moods.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setMoodFilter(mood)}
                            className={`mood-filter ${moodFilter === mood ? 'active' : ''}`}
                            title={`${getMoodLabel(mood)}`}
                        >
                            {getMoodEmoji(mood)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calendar-weekdays">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {renderCalendar()}
            </div>
        </div>
    );
} 