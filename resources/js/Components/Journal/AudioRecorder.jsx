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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Usar webm que es el formato nativo de grabación
            const options = {
                mimeType: 'audio/webm'
            };

            mediaRecorder.current = new MediaRecorder(stream, options);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            mediaRecorder.current.onstop = () => {
                try {
                    const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], 'audio.webm', { 
                        type: 'audio/webm',
                        lastModified: Date.now()
                    });
                    
                    const url = URL.createObjectURL(audioFile);
                    setAudioUrl(url);
                    onRecordingComplete(audioFile, recordingDuration);
                } catch (error) {
                    console.error('Error al procesar el audio:', error);
                    setError('Error al procesar el audio. Por favor, inténtalo de nuevo.');
                }
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
                    className="record-button w-full sm:w-auto px-4 py-3 md:px-6 flex items-center justify-center gap-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    title="Iniciar grabación"
                >
                    <FaMicrophone className="text-lg md:text-xl" />
                    <span className="text-base md:text-lg">Grabar audio</span>
                </button>
            ) : isRecording ? (
                <div className="recording-controls flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto">
                    <div className="recording-time pulse text-lg md:text-xl text-primary mb-2 sm:mb-0">
                        {formatTime(recordingDuration)}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={stopRecording}
                            className="stop-button px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            title="Detener grabación"
                        >
                            <FaStop className="text-base md:text-lg" />
                            <span>Detener</span>
                        </button>
                        <button
                            onClick={cancelRecording}
                            className="cancel-button px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Cancelar grabación"
                        >
                            <FaTrash className="text-base md:text-lg" />
                            <span>Cancelar</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm transition-colors">
                    <div className="text-gray-600 dark:text-gray-300 text-center text-base md:text-lg mb-3">
                        Duración: {formatTime(recordingDuration)}
                    </div>
                    <audio
                        ref={audioPlayer}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        controls
                        className="w-full mb-4"
                    />
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 md:py-3 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-base md:text-lg"
                        title="Borrar grabación"
                    >
                        <FaTrash className="text-base md:text-lg" />
                        <span>Borrar y grabar nuevo</span>
                    </button>
                    {showDeleteConfirm && (
                        <div className="mt-4 flex flex-col items-center gap-3">
                            <span className="text-gray-600 dark:text-gray-300 text-base md:text-lg">¿Borrar audio?</span>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                    onClick={deleteRecording}
                                    className="w-full sm:w-auto px-6 py-2 md:py-3 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors text-base md:text-lg"
                                >
                                    Sí, borrar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full sm:w-auto px-6 py-2 md:py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-base md:text-lg"
                                >
                                    No, mantener
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioRecorder; 