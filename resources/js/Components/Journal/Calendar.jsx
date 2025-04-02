import React, { useState } from 'react';

export default function Calendar({ entries, onEntryClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodFilter, setMoodFilter] = useState(null);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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
                    onClick={() => hasEntries && onEntryClick(entriesForDay)}
                >
                    <span className="day-number">{day}</span>
                    {hasEntries && (
                        <div className="entries-preview">
                            {entriesForDay.map((entry, index) => (
                                <div 
                                    key={index}
                                    className={`entry-dot mood-${entry.mood}`}
                                    title={`${getMoodEmoji(entry.mood)} ${new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment));
    };

    const moods = ['happy', 'neutral', 'sad', 'angry', 'frustrated'];

    return (
        <div className="calendar-container">
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
                            className={`mood-filter ${moodFilter === mood ? 'active' : ''}`}
                            onClick={() => setMoodFilter(mood)}
                            title={getMoodLabel(mood)}
                        >
                            {getMoodEmoji(mood)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calendar-header">
                <button 
                    onClick={() => changeMonth(-1)}
                    className="calendar-nav-button"
                    title="Mes anterior"
                >
                    ←
                </button>
                <h2>
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button 
                    onClick={() => changeMonth(1)}
                    className="calendar-nav-button"
                    title="Mes siguiente"
                >
                    →
                </button>
            </div>
            <div className="calendar-weekdays">
                <div>Dom</div>
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
            </div>
            <div className="calendar-grid">
                {renderCalendar()}
            </div>
            
        </div>
    );
} 