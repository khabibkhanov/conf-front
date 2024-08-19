import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Speaker = () => {
  const videoRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://192.168.100.41:3001');
    console.log('Connected to server as speaker');
    socketRef.current.emit('broadcaster');

    socketRef.current.on('transcript', (text) => {
      console.log('Received transcript:', text);
      setTranscript(text);
    });

    navigator?.mediaDevices?.getUserMedia({ video: true, audio: true }).then(stream => {
      console.log('Media stream obtained');
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaRecorder = new MediaRecorder(stream);
      const source = audioContext.createMediaStreamSource(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Sending audio for transcription');
          const reader = new FileReader();
          reader.readAsArrayBuffer(event.data);
          reader.onloadend = () => {
            socketRef.current.emit('startSpeaking', reader.result);
          };
        }
      };

      mediaRecorder.start(1000);

      return () => {
        console.log('Stopping media stream');
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
    });

    return () => {
      console.log('Disconnecting from server');
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
