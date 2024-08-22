import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Listener = () => {
    const [targetLang, setTargetLang] = useState('es');
    const [translatedTexts, setTranslatedTexts] = useState([]);
    const audioRef = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io.connect('http://localhost:5000');

        socket.current.emit('set-listener-lang', targetLang);

        socket.current.on('listener-transcription', ({ translatedText }) => {
            setTranslatedTexts(prev => [...prev, translatedText]);
        });

        socket.current.on('translated-speech', (audioData) => {
            const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        });

        return () => {
            socket.current.disconnect();
        };
    }, [targetLang]);

    return (
        <div>
            <h1>Listener Page</h1>
            <label>
                Choose your language:
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    {/* Add more languages as needed */}
                </select>
            </label>
            
            <div>
            <audio ref={audioRef} controls />

                <h2>Translated Texts</h2>
                <ul>
                    {translatedTexts.map((text, index) => (
                        <li key={index}>{text}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Listener;
