import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Listener = () => {
  const videoRef = useRef(null);
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('en');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://192.168.100.41:3001');
    console.log('Connected to server as listener');
    socketRef.current.emit('watcher');

    socketRef.current.on('offer', (id, description) => {
      console.log('Received offer:', description);
      const peerConnection = new RTCPeerConnection();
      peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      peerConnection.createAnswer()
        .then(sdp => {
          console.log('Sending answer:', sdp);
          return peerConnection.setLocalDescription(sdp);
        })
        .then(() => socketRef.current.emit('answer', id, peerConnection.localDescription));

      peerConnection.ontrack = (event) => {
        console.log('Received track:', event.streams[0]);
        videoRef.current.srcObject = event.streams[0];
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate);
          socketRef.current.emit('candidate', id, event.candidate);
        }
      };
    });

    socketRef.current.on('translatedSpeech', ({ translatedText, audioUrl }) => {
      console.log('Received translated speech:', translatedText);
      setTranslatedText(translatedText);
      const audio = new Audio(audioUrl);
      audio.play();
    });

    return () => {
      console.log('Disconnecting from server');
      socketRef.current.disconnect();
    };
  }, []);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    console.log('Language changed to:', e.target.value);
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
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Listener;
