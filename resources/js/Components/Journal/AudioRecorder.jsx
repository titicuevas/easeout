import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaTrash } from 'react-icons/fa';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const timerInterval = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/mp3' });
                onRecordingComplete(blob, recordingDuration);
                chunks.current = [];
                setRecordingDuration(0);
            };

            mediaRecorder.current.start();
            setIsRecording(true);

            // Iniciar el temporizador
            let startTime = Date.now();
            timerInterval.current = setInterval(() => {
                const duration = (Date.now() - startTime) / 1000;
                setRecordingDuration(duration);
            }, 100);

        } catch (err) {
            console.error('Error al iniciar la grabación:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerInterval.current);
            setIsRecording(false);
            // La duración final se enviará en el evento onstop
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

    return (
        <div className="audio-recorder">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="record-button"
                    title="Iniciar grabación"
                >
                    <FaMicrophone />
                    <span>Grabar audio</span>
                </button>
            ) : (
                <div className="recording-controls">
                    <div className="recording-time">
                        {Math.floor(recordingDuration)}s
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
            )}
        </div>
    );
};

export default AudioRecorder; 