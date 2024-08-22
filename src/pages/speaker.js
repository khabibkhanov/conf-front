import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Speaker = () => {
    const [transcripts, setTranscripts] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const socket = useRef(null);
    const mediaRecorder = useRef(null);

    useEffect(() => {
        console.log('Connecting to server...');
        socket.current = io.connect('http://localhost:5000');

        socket.current.on('speaker-transcription', ({ transcript }) => {
            console.log(`Received transcript: ${transcript}`);
            setTranscripts(prev => [...prev, transcript]);
        });

        socket.current.on('error', (message) => {
            console.error(`Error from server: ${message}`);
        });

        return () => {
            if (mediaRecorder.current) {
                mediaRecorder.current.stop();
            }
            socket.current.disconnect();
            console.log('Disconnected from server');
        };
    }, []);

    const startStreaming = () => {
        console.log('Starting stream...');
        navigator?.mediaDevices?.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder.current = new MediaRecorder(stream);
                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        console.log('Sending audio data');
                        socket.current.emit('audio-data', event.data);
                    }
                };
                mediaRecorder.current.start(100);
                setIsStreaming(true);
            })
            .catch(error => {
                console.error('Error accessing audio stream:', error);
            });
    };

    const stopStreaming = () => {
        console.log('Stopping stream...');
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
        }
        socket.current.emit('stop-stream');
        setIsStreaming(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Speaker Page</h1>
            <button
                onClick={isStreaming ? stopStreaming : startStreaming}
                style={{ padding: '10px 20px', fontSize: '18px', marginBottom: '20px' }}
            >
                {isStreaming ? 'Stop Speaking' : 'Start Speaking'}
            </button>
            <div>
                <h2>Transcripts</h2>
                <ul>
                    {transcripts.map((transcript, index) => (
                        <li key={index}>{transcript}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Speaker;
