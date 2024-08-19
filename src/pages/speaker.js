import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Speaker = () => {
  const videoRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    socketRef.current.emit('broadcaster');

    socketRef.current.on('transcript', (text) => {
      setTranscript(text);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaRecorder = new MediaRecorder(stream);
      const source = audioContext.createMediaStreamSource(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.readAsArrayBuffer(event.data);
          reader.onloadend = () => {
            socketRef.current.emit('startSpeaking', reader.result);
          };
        }
      };

      mediaRecorder.start(1000);

      return () => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <div>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default Speaker;
