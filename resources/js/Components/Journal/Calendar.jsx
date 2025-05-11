import React, { useState, useEffect } from 'react';
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
    startOfWeek: (date, options) => startOfWeek(date, { weekStartsOn: 1, ...options }),
    getDay,
    locales,
});

export default function Calendar({ entries, onEntryClick }) {
    const [moodFilter, setMoodFilter] = useState(null);
    const [defaultView, setDefaultView] = useState('month');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setDefaultView('day');
            } else {
                setDefaultView('month');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Agrupar entradas por fecha (usando entry_date o created_at)
    const groupEntriesByDate = (entries) => {
        const map = {};
        entries.forEach(entry => {
            const dateKey = (entry.entry_date || entry.created_at).split('T')[0];
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(entry);
        });
        return map;
    };

    const groupedEntries = groupEntriesByDate(entries);

    // Convertir las entradas al formato que espera react-big-calendar
    const events = entries
        .filter(entry => !moodFilter || entry.mood === moodFilter)
        .sort((a, b) => {
            // Ordenar por fecha (entry_date o created_at) y luego por hora de creación
            const dateA = new Date(a.entry_date || a.created_at);
            const dateB = new Date(b.entry_date || b.created_at);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // Si es el mismo día, ordenar por hora de creación
            return new Date(a.created_at) - new Date(b.created_at);
        })
        .map(entry => ({
            id: entry.id,
            title: `${getMoodEmoji(entry.mood)} ${entry.content ? entry.content.substring(0, 30) + '...' : ''}`,
            start: new Date(entry.entry_date || entry.created_at),
            end: new Date(entry.entry_date || entry.created_at),
            allDay: true,
            resource: entry
        }));

    // Mostrar todas las entradas del día al pulsar '+ Ver más' o al hacer clic en un día
    const handleShowMore = (events, date) => {
        if (events && events.length > 0) {
            onEntryClick(events.map(e => e.resource));
        }
    };

    // Al hacer clic en un día, usar handleShowMore para unificar la lógica
    const handleSelectSlot = (slotInfo) => {
        handleShowMore([], slotInfo.start);
    };

    // Al hacer clic en un evento (entrada individual)
    const handleSelectEvent = (event) => {
        onEntryClick([event.resource]);
    };

    const moods = [
        'happy', 'neutral', 'sad', 'angry', 'frustrated',
        'in_love', 'heartbroken', 'grateful', 'motivated', 'tired',
        'anxious', 'hopeful', 'proud', 'surprised', 'inspired'
    ];

    // Eliminar el botón 'Hoy' de la barra de herramientas
    const customToolbar = (toolbar) => (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button type="button" onClick={() => toolbar.onNavigate('PREV')}>Anterior</button>
                <button type="button" onClick={() => toolbar.onNavigate('NEXT')}>Siguiente</button>
            </span>
            <span className="rbc-toolbar-label">{toolbar.label}</span>
        </div>
    );

    // Al hacer clic en un día del mes (o en '+ Ver más'), mostrar todas las entradas de ese día
    const handleDrillDown = (date) => {
        const dateKey = date.toISOString().split('T')[0];
        const dayEntries = entries.filter(entry => {
            const entryDate = (entry.entry_date || entry.created_at).split('T')[0];
            return entryDate === dateKey;
        });
        if (dayEntries.length > 0) {
            onEntryClick(dayEntries);
        }
        return null;
    };

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
                    onSelectSlot={handleSelectSlot}
                    selectable
                    views={['month']}
                    defaultView={'month'}
                    components={{
                        toolbar: customToolbar
                    }}
                    onShowMore={handleShowMore}
                    onDrillDown={handleDrillDown}
                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento",
                        showMore: total => `+ Ver más (${total})`,
                        work_week: "Semana laboral",
                        agenda: "Agenda",
                        noEventsInRange: "No hay eventos en este rango.",
                        allDay: "Todo el día",
                        sunday: "Domingo",
                        monday: "Lunes",
                        tuesday: "Martes",
                        wednesday: "Miércoles",
                        thursday: "Jueves",
                        friday: "Viernes",
                        saturday: "Sábado",
                    }}
                    formats={{
                        monthHeaderFormat: (date, culture, localizer) =>
                            format(date, "MMMM yyyy", { locale: es }),
                        dayHeaderFormat: (date, culture, localizer) =>
                            format(date, "EEEE d MMMM", { locale: es }),
                        weekdayFormat: (date, culture, localizer) =>
                            format(date, "EEE", { locale: es }),
                        dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                            `${format(start, "d 'de' MMMM", { locale: es })} – ${format(end, "d 'de' MMMM", { locale: es })}`,
                    }}
                    eventPropGetter={(event) => {
                        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                        return {
                            className: `mood-${event.resource.mood}`,
                            style: {
                                backgroundColor: isDark ? 'var(--primary-color)' : 'var(--primary-color)',
                                borderRadius: '4px',
                                opacity: 0.9,
                                color: isDark ? '#fff' : 'white',
                                border: '0',
                                display: 'block',
                                fontSize: window.innerWidth < 640 ? '0.95rem' : '1rem',
                                padding: window.innerWidth < 640 ? '0.25rem 0.5rem' : '0.25rem 1rem',
                            }
                        };
                    }}
                />
            </div>
        </div>
    );
} 