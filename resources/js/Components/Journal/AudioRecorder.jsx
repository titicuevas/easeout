import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaTrash, FaPlay, FaPause } from 'react-icons/fa';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState(null);
    const mediaRecorder = useRef(null);
    const audioPlayer = useRef(null);
    const chunks = useRef([]);
    const timerInterval = useRef(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true
            });

            // Intentar diferentes formatos de audio
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                mimeType = 'audio/ogg';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(chunks.current, { type: 'audio/mpeg' });
                const audioFile = new File([audioBlob], 'audio-recording.mp3', { 
                    type: 'audio/mpeg'
                });
                
                const url = URL.createObjectURL(audioFile);
                setAudioUrl(url);
                
                const duration = recordingDuration;
                onRecordingComplete(audioFile, duration);
            };

            mediaRecorder.current.start(100);
            setIsRecording(true);
            setRecordingDuration(0);

            const startTime = Date.now();
            timerInterval.current = setInterval(() => {
                const duration = (Date.now() - startTime) / 1000;
                setRecordingDuration(duration);
            }, 100);

        } catch (err) {
            console.error('Error al iniciar la grabación:', err);
            if (err.name === 'NotAllowedError') {
                setError('Por favor, permite el acceso al micrófono para grabar audio.');
            } else if (err.name === 'NotFoundError') {
                setError('No se encontró ningún micrófono. Conecta un micrófono y vuelve a intentarlo.');
            } else {
                setError('Error al iniciar la grabación. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerInterval.current);
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
            setIsPlaying(false);
            setShowDeleteConfirm(false);
            setRecordingDuration(0);
            onRecordingComplete(null, 0);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerInterval.current);
            setIsRecording(false);
            chunks.current = [];
            setRecordingDuration(0);
            onRecordingComplete(null, 0);
        }
    };

    const togglePlayback = () => {
        if (audioPlayer.current) {
            if (isPlaying) {
                audioPlayer.current.pause();
            } else {
                audioPlayer.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="audio-recorder">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {!isRecording && !audioUrl ? (
                <button
                    onClick={startRecording}
                    className="record-button"
                    title="Iniciar grabación"
                >
                    <FaMicrophone />
                    <span>Grabar audio</span>
                </button>
            ) : isRecording ? (
                <div className="recording-controls">
                    <div className="recording-time pulse">
                        {formatTime(recordingDuration)}
                    </div>
                    <button
                        onClick={stopRecording}
                        className="stop-button"
                        title="Detener grabación"
                    >
                        <FaStop />
                        <span>Detener</span>
                    </button>
                    <button
                        onClick={cancelRecording}
                        className="cancel-button"
                        title="Cancelar grabación"
                    >
                        <FaTrash />
                        <span>Cancelar</span>
                    </button>
                </div>
            ) : (
                <div className="audio-preview">
                    <div className="audio-info">
                        <span className="audio-duration">
                            Duración: {formatTime(recordingDuration)}
                        </span>
                    </div>
                    <audio
                        ref={audioPlayer}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        controls
                    />
                    <div className="audio-actions">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="cancel-button"
                                title="Borrar grabación"
                            >
                                <FaTrash />
                                <span>Borrar y grabar nuevo</span>
                            </button>
                        ) : (
                            <div className="delete-confirmation">
                                <span>¿Borrar audio?</span>
                                <button
                                    onClick={deleteRecording}
                                    className="cancel-button confirm"
                                    title="Confirmar borrado"
                                >
                                    Sí, borrar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="stop-button cancel"
                                    title="Cancelar borrado"
                                >
                                    No, mantener
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder; 