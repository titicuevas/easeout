import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function Calendar({ entries, onEntryClick }) {
    const [moodFilter, setMoodFilter] = useState(null);

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
        anxious: '😰',
        hopeful: '🌱',
        proud: '🦁',
        surprised: '😲',
        inspired: '💡'
    };

    const getMoodEmoji = (mood) => {
        if (!mood) return '❓';
        const key = mood.replace(/-/g, '_').toLowerCase();
        return moodMap[key] || '❓';
    };

    const getMoodLabel = (mood) => {
        if (!mood) return 'Desconocido';
        const key = mood.replace(/-/g, '_').toLowerCase();
        switch (key) {
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

    // Convertir las entradas al formato que espera react-big-calendar
    const events = entries
        .filter(entry => !moodFilter || entry.mood === moodFilter)
        .map(entry => ({
            id: entry.id,
            title: `${getMoodEmoji(entry.mood)} ${entry.content ? entry.content.substring(0, 30) + '...' : ''}`,
            start: new Date(entry.entry_date || entry.created_at),
            end: new Date(entry.entry_date || entry.created_at),
            resource: entry
        }));

    const handleSelectEvent = (event) => {
        onEntryClick([event.resource]);
    };

    const moods = [
        'happy', 'neutral', 'sad', 'angry', 'frustrated',
        'in_love', 'heartbroken', 'grateful', 'motivated', 'tired',
        'anxious', 'hopeful', 'proud', 'surprised', 'inspired'
    ];

    return (
        <div className="calendar-container">
            <div className="calendar-filters mb-4">
                <div className="mood-filters flex flex-wrap gap-2">
                    <button 
                        className={`mood-filter ${!moodFilter ? 'active' : ''} px-3 py-1 rounded-full text-sm`}
                        onClick={() => setMoodFilter(null)}
                    >
                        Todos
                    </button>
                    {moods.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setMoodFilter(mood)}
                            className={`mood-filter ${moodFilter === mood ? 'active' : ''} px-3 py-1 rounded-full text-sm`}
                            title={getMoodLabel(mood)}
                        >
                            {getMoodEmoji(mood)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calendar-wrapper" style={{ height: '600px' }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day']}
                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día"
                    }}
                    eventPropGetter={(event) => ({
                        className: `mood-${event.resource.mood}`,
                        style: {
                            backgroundColor: 'var(--primary-color)',
                            borderRadius: '4px',
                            opacity: 0.8,
                            color: 'white',
                            border: '0',
                            display: 'block'
                        }
                    })}
                />
            </div>
        </div>
    );
} 