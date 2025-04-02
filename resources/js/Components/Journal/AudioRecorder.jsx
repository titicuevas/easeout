import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const RecorderContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.light}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const RecordButton = styled(Button)(({ theme, isrecording }) => ({
    width: '200px',
    height: '60px',
    borderRadius: '30px',
    fontSize: '1.1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    backgroundColor: isrecording === 'true' ? theme.palette.error.main : theme.palette.primary.main,
    color: '#FFF',
    '&:hover': {
        backgroundColor: isrecording === 'true' ? theme.palette.error.dark : theme.palette.primary.dark,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.grey[300],
    },
}));

const RecordingIndicator = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 8,
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
}));

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => {
            clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error al acceder al micrófono:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <RecorderContainer elevation={0}>
            <RecordButton
                variant="contained"
                isrecording={isRecording.toString()}
                onClick={isRecording ? stopRecording : startRecording}
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            >
                {isRecording ? 'Detener grabación' : 'Iniciar grabación'}
            </RecordButton>
            
            {isRecording && (
                <RecordingIndicator>
                    <GraphicEqIcon />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Grabando: {formatTime(recordingTime)}
                    </Typography>
                </RecordingIndicator>
            )}
        </RecorderContainer>
    );
};

export default AudioRecorder; 