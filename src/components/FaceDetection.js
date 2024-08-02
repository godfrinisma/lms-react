import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Grid, Card, CardContent, Typography, Button, Modal, Box } from '@mui/material';

const FaceDetection = ({ courseName }) => {
  const videoRef = useRef(null); // Ref for the course video
  const webcamRef = useRef(null); // Ref for the webcam stream
  const [detectionActive, setDetectionActive] = useState(true); // State to control detection
  const [attentionStatus, setAttentionStatus] = useState(''); // State for attention status
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to manage alert modal visibility
  const [alertMessage, setAlertMessage] = useState(''); // State to manage alert message
  const socket = useRef(null); // Ref to hold socket instance
  const predictionInterval = useRef(null); // Ref for interval ID
  const navigate = useNavigate(); // Use useNavigate for navigation
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // State to check if video is playing

  // Function to start webcam and set up sockets
  const startWebcamAndSockets = () => {
    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        // Set webcam stream to video element
        webcamRef.current.srcObject = stream;
        webcamRef.current.play().catch((err) => {
          console.error("Error playing webcam video automatically: ", err);
        }); // Play the webcam video

        // Initialize socket connection
        socket.current = io('http://localhost:5000');

        socket.current.on('connect', () => {
          console.log('Connected to server');
          socket.current.on('server_message', (message) => {
            console.log(message.data);
          });
        });

        socket.current.on('regular_status', (message) => {
          if (detectionActive) {
            console.log(message.status);
            setAttentionStatus(message.status); // Update attention status only if detection is active
          }
        });

        socket.current.on('attention_status', (message) => {
          console.log(message.status);
          if (message.status !== "") {
            showAlert(message.status);
          }
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Function to start the prediction interval
        const startPredictionInterval = () => {
          if (!predictionInterval.current) {
            predictionInterval.current = setInterval(() => {
              if (detectionActive && webcamRef.current.readyState === 4) { // Ensure webcam is ready
                canvas.width = webcamRef.current.videoWidth;
                canvas.height = webcamRef.current.videoHeight;
                context.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                socket.current.emit('image', imageData);
              }
            }, 1000);
          }
        };

        // Start the prediction interval
        startPredictionInterval();

        // Automatically play the video when the course starts
        const videoElement = videoRef.current;
        videoElement.muted = true; // Mute for autoplay policies

        // Listen for the `canplay` event to ensure video is ready
        videoElement.addEventListener('canplay', () => {
          if (!isVideoPlaying) { // Check if the video is not already playing
            videoElement.play().then(() => {
              setIsVideoPlaying(true);
              console.log("Course video playing automatically");
              videoElement.muted = false; // Unmute once playing
            }).catch((err) => {
              console.error("Error playing course video automatically: ", err);
            });
          }
        });

        // Load the video source and prepare it for playback
        videoElement.load();

        // Event listeners for video playback state
        videoElement.addEventListener('play', startPredictionInterval);
        videoElement.addEventListener('pause', () => {
          clearInterval(predictionInterval.current);
          predictionInterval.current = null;
          setDetectionActive(false);
          setTimeout(() => {
            setAttentionStatus('Detection System Stopped'); // Update attention status after delay
          }, 100);
        });
      })
      .catch((err) => {
        console.error('Error accessing webcam: ', err);
      });
  };

  // Function to show alert when attention status changes
  const showAlert = (message) => {
    const videoElement = videoRef.current;
    videoElement.pause(); // Pause the video when showing the alert
    setAlertMessage(message);

    setIsAlertOpen(true)
  };

  const handleAlertClose = () => {
    const videoElement = videoRef.current;
    setIsAlertOpen(false); // Close the alert modal
    videoElement.play().catch((err) => {
      console.error("Error resuming video playback: ", err);
    });
    setDetectionActive(true); // Resume detection
    socket.current.emit('acknowledge_alert');
  };

  // Effect to start webcam and video immediately on page load
  useEffect(() => {
    startWebcamAndSockets(); // Start webcam and sockets when the component mounts
  }, []); // Empty dependency array ensures this runs once on mount

  // Determine the attention status color
  const attentionColor = attentionStatus.includes("Not Attentive") || attentionStatus === 'Detection System Stopped' ? 'red' : 'green';

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <Typography variant="h4" component="h1" gutterBottom>
              {courseName}
            </Typography>
            <Button onClick={() => navigate('/')} sx={{ mb: 5 }} variant="contained" color="primary">
              Go to Home
            </Button>
          </div>
        </div>

        <Grid container spacing={4} className="mt-5" alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Card style={{ height: '100%' }}> {/* Set equal height for the card */}
              <CardContent className="card-content">
                <Typography variant="h6" component="div">
                  Course Video
                </Typography>
                <video ref={videoRef} id="courseVideo" controls controlsList="nofullscreen" className="w-100 card-video">
                  <source src="/video.mp4" type="video/mp4" /> {/* Ensure this path matches your video source */}
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card style={{ height: '100%' }}> {/* Set equal height for the card */}
              <CardContent className="card-content">
                <Typography
                  variant="h6"
                  component="div"
                  className={`attention-status ${attentionColor === 'red' ? 'not-attentive' : ''} ${attentionStatus === 'Detection System Stopped' ? 'detection-stopped' : ''}`}
                >
                  {attentionStatus || 'No Data'}
                </Typography>
                <video ref={webcamRef} autoPlay muted className="w-100 card-video">
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
      <Modal
        open={isAlertOpen}
        onClose={handleAlertClose}
        aria-labelledby="alert-title"
        aria-describedby="alert-description"
        disableEscapeKeyDown // Prevent closing with the escape key
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          className="modal-box"
        >
          <Typography id="alert-title" variant="h6" component="h2" className="modal-title">
            Attention Required
          </Typography>
          <Typography id="alert-description" className="modal-description">
            {alertMessage}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleAlertClose}>
            OK
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default FaceDetection;
