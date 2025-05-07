import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';

const AudioRecorder = ({ onAudioSave, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeletingAudio, setIsDeletingAudio] = useState(false);
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
            setIsProcessing(true);
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
                    if (typeof onAudioSave === 'function') {
                        onAudioSave(audioFile, recordingDuration);
                    } else {
                        console.error('onAudioSave no es una función', onAudioSave);
                    }
                    setError(null);
                } catch (error) {
                    console.error('Error al procesar el audio:', error);
                    setError('Error al procesar el audio. Puede que el archivo no se haya guardado correctamente. Por favor, revisa tu conexión o contacta con soporte.');
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.current.start(100);
            setIsRecording(true);
            setRecordingDuration(0);
            setIsProcessing(false);

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
            setIsProcessing(false);
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

        try {
            setIsProcessing(true);

            // Detener el temporizador primero
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }

            return new Promise((resolve) => {
                mediaRecorder.current.onstop = () => {
                    try {
                        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
                        const audioFile = new File([audioBlob], 'audio.webm', { 
                            type: 'audio/webm',
                            lastModified: Date.now()
                        });
                        
                        const url = URL.createObjectURL(audioFile);
                        setAudioUrl(url);
                        if (typeof onAudioSave === 'function') {
                            onAudioSave(audioFile, recordingDuration);
                        } else {
                            console.error('onAudioSave no es una función', onAudioSave);
                        }
                        setError(null);
                        resolve();
                    } catch (error) {
                        console.error('Error al procesar el audio:', error);
                        setError('Error al procesar el audio. Puede que el archivo no se haya guardado correctamente. Por favor, revisa tu conexión o contacta con soporte.');
                        resolve();
                    }
                };

                // Detener la grabación
                if (mediaRecorder.current.state !== 'inactive') {
                    mediaRecorder.current.stop();
                }

                // Detener todos los tracks del stream
                if (mediaRecorder.current.stream) {
                    mediaRecorder.current.stream.getTracks().forEach(track => {
                        if (track.readyState === 'live') {
                            track.stop();
                        }
                    });
                }

                setIsRecording(false);
            });
        } catch (error) {
            console.error('Error al detener la grabación:', error);
            setError('Error al detener la grabación. Por favor, recarga la página e inténtalo de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteRecording = async () => {
        setIsDeletingAudio(true);
        try {
            const result = await Swal.fire({
                title: '¿Borrar audio?',
                text: '¿Estás seguro de que quieres borrar este audio? Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            });
            if (result.isConfirmed) {
                setIsProcessing(true);
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                    setIsPlaying(false);
                    setRecordingDuration(0);
                    if (typeof onAudioSave === 'function') {
                        onAudioSave(null, 0);
                    } else {
                        console.error('onAudioSave no es una función', onAudioSave);
                    }
                    await Swal.fire('¡Borrado!', 'El audio ha sido eliminado.', 'success');
                }
                setIsProcessing(false);
                setIsDeletingAudio(false); // Solo aquí, después de todo el proceso
            } else {
                setIsDeletingAudio(false); // Si cancela, también aquí
            }
        } catch (error) {
            console.error('Error al eliminar la grabación:', error);
            setError('Error al eliminar la grabación. Por favor, inténtalo de nuevo.');
            setIsDeletingAudio(false);
            setIsProcessing(false);
        }
    };

    const cancelRecording = async () => {
        if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

        try {
            setIsProcessing(true);

            // Detener el temporizador primero
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }

            return new Promise((resolve) => {
                // Detener la grabación
                if (mediaRecorder.current.state !== 'inactive') {
                    mediaRecorder.current.stop();
                }

                // Detener todos los tracks del stream
                if (mediaRecorder.current.stream) {
                    mediaRecorder.current.stream.getTracks().forEach(track => {
                        if (track.readyState === 'live') {
                            track.stop();
                        }
                    });
                }

                setIsRecording(false);
                chunks.current = [];
                setRecordingDuration(0);
                if (typeof onAudioSave === 'function') {
                    onAudioSave(null, 0);
                } else {
                    console.error('onAudioSave no es una función', onAudioSave);
                }
                resolve();
            });
        } catch (error) {
            console.error('Error al cancelar la grabación:', error);
            setError('Error al cancelar la grabación. Por favor, recarga la página e inténtalo de nuevo.');
        } finally {
            setIsProcessing(false);
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
                <div className="journal-error bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {error}
                </div>
            )}
            
            {!isRecording && !audioUrl ? (
                <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className={`record-button w-full sm:w-auto px-4 py-3 md:px-6 flex items-center justify-center gap-2 rounded-lg transition-colors ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
                    }`}
                    style={{ backgroundColor: 'var(--primary-color)', color: 'var(--paper-color)' }}
                    title={isProcessing ? 'Procesando...' : 'Iniciar grabación'}
                >
                    <FaMicrophone className="text-lg md:text-xl" style={{ color: 'var(--paper-color)' }} />
                    <span className="text-base md:text-lg">
                        {isProcessing ? 'Procesando...' : 'Grabar audio'}
                    </span>
                </button>
            ) : isRecording ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="recording-time pulse text-lg md:text-xl text-primary mb-2 sm:mb-0 dark:text-gray-200">
                        {formatTime(recordingDuration)}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={stopRecording}
                            disabled={isProcessing}
                            className={`stop-button px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 rounded-lg transition-colors ${
                                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
                            }`}
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--paper-color)' }}
                            title={isProcessing ? 'Procesando...' : 'Detener grabación'}
                        >
                            <FaStop className="text-base md:text-lg" style={{ color: 'var(--paper-color)' }} />
                            <span>{isProcessing ? 'Procesando...' : 'Detener'}</span>
                        </button>
                        <button
                            onClick={cancelRecording}
                            disabled={isProcessing}
                            className={`cancel-button px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 bg-red-500 text-white rounded-lg transition-colors ${
                                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                            }`}
                            title={isProcessing ? 'Procesando...' : 'Cancelar grabación'}
                        >
                            <FaTrash className="text-base md:text-lg" />
                            <span>{isProcessing ? 'Procesando...' : 'Cancelar'}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md mx-auto rounded-lg p-4 md:p-6 shadow-sm transition-colors"
                    style={{ backgroundColor: 'var(--paper-color)' }}>
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
                        onClick={deleteRecording}
                        disabled={disabled || isProcessing || isDeletingAudio}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 md:py-3 text-red-500 dark:text-red-400 transition-colors ${
                            (disabled || isProcessing || isDeletingAudio) ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600 dark:hover:text-red-300'
                        }`}
                        title={isProcessing || isDeletingAudio ? 'Procesando...' : 'Borrar grabación'}
                    >
                        {isDeletingAudio ? <ClipLoader size={18} color="#e53e3e" /> : <FaTrash className="text-base md:text-lg" />}
                        <span>{isProcessing || isDeletingAudio ? 'Borrando...' : 'Borrar y grabar nuevo'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder; 