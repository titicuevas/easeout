import React, { useState } from 'react';
import '../../../css/journal.css';
import AudioRecorder from './AudioRecorder';

const moods = [
    { emoji: '😊', label: 'Alegre', value: 'happy' },
    { emoji: '😐', label: 'Normal', value: 'neutral' },
    { emoji: '😢', label: 'Triste', value: 'sad' },
    { emoji: '😠', label: 'Enfadado', value: 'angry' },
    { emoji: '😫', label: 'Rallado', value: 'frustrated' }
];

const JournalEntry = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [content, setContent] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
    };

    const handleContentChange = (event) => {
        setContent(event.target.value);
    };

    const handleRecordingComplete = (blob) => {
        setAudioBlob(blob);
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('mood', selectedMood?.value || '');
            formData.append('content', content);
            formData.append('metadata', JSON.stringify({
                timestamp: new Date().toISOString()
            }));

            if (audioBlob) {
                formData.append('audio', audioBlob, 'recording.mp3');
                formData.append('duration', 0);
            }

            const response = await fetch('/journal-entries', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                setSelectedMood(null);
                setContent('');
                setAudioBlob(null);
            }
        } catch (error) {
            console.error('Error al guardar la entrada:', error);
        }
    };

    return (
        <div className="journal-container">
            <div className="journal-paper">
                <h1 className="journal-title">
                    ¿Cómo te sientes hoy?
                </h1>

                <div className="my-6">
                    <div className="flex justify-center flex-wrap gap-2">
                        {moods.map((mood) => (
                            <button
                                key={mood.value}
                                className={`mood-button mood-${mood.value} ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                                onClick={() => handleMoodSelect(mood)}
                            >
                                <span className="emoji">{mood.emoji}</span>
                                <span className="label">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="my-6">
                    <h2 className="journal-subtitle">
                        ¿Qué quieres compartir?
                    </h2>
                    <div className="journal-textarea">
                        <textarea
                            rows={6}
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Escribe lo que sientes..."
                        />
                    </div>
                </div>

                <div className="my-6">
                    <h2 className="journal-subtitle">
                        O graba un mensaje de voz
                    </h2>
                    <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={!selectedMood && !content && !audioBlob}
                    >
                        Guardar entrada
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry; 