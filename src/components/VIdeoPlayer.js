// src/components/VideoPlayer.js

import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ socket }) => {
  const videoRef = useRef(null);
  const webcamRef = useRef(null); // Reference for webcam video element

  useEffect(() => {
    const videoElement = videoRef.current;

    // Function to start webcam stream
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Attach the webcam stream to the video element
        webcamRef.current.srcObject = stream;
        webcamRef.current.play(); // Start playing the webcam stream

        // Emit webcam frames to server periodically
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Emit frames every second
        const intervalId = setInterval(() => {
          if (webcamRef.current.readyState === 4) { // Check if webcam is ready
            canvas.width = webcamRef.current.videoWidth;
            canvas.height = webcamRef.current.videoHeight;
            context.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            if (socket) {
              socket.emit('image', imageData);
            }
          }
        }, 1000);

        return () => clearInterval(intervalId); // Clean up on component unmount
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    // Event listeners for play and pause
    const handlePlay = () => {
      if (socket) {
        socket.emit('play', { message: 'Video started playing' });
      }
    };

    const handlePause = () => {
      if (socket) {
        socket.emit('pause', { message: 'Video paused' });
      }
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    startWebcam(); // Start the webcam stream when the component mounts

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [socket]);

  return (
    <div>
      <video ref={webcamRef} style={{ width: '100%', border: '2px solid #343a40', borderRadius: '10px' }} />
      <video ref={videoRef} controls className="w-75">
        <source src="/myvid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
