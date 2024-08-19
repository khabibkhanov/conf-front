import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Listener = () => {
  const videoRef = useRef(null);
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('en');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    socketRef.current.emit('watcher');

    socketRef.current.on('offer', (id, description) => {
      const peerConnection = new RTCPeerConnection();
      peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      peerConnection.createAnswer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => socketRef.current.emit('answer', id, peerConnection.localDescription));

      peerConnection.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('candidate', id, event.candidate);
        }
      };
    });

    socketRef.current.on('translatedSpeech', ({ translatedText, audioUrl }) => {
      setTranslatedText(translatedText);
      const audio = new Audio(audioUrl);
      audio.play();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    socketRef.current.emit('translateSpeech', { text: translatedText, targetLanguage: e.target.value });
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <div>
        <h3>Translated Transcript:</h3>
        <p>{translatedText}</p>
      </div>
      <div>
        <label>
          Choose language:
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="ru">Russian</option>
            <option value="es">Spanish</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Listener;
