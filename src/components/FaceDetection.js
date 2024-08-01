import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useLocation } from 'react-router-dom';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';

const features_to_keep = [
  'pose_x', 'pose_y', 'pose_down', 'pose_forward', 'pose_left', 'pose_right',
  'pupilLeft_x', 'pupilLeft_y', 'pupilRight_x', 'pupilRight_y',
  'eyeLeftOuter_x', 'eyeLeftOuter_y', 'eyeLeftInner_x', 'eyeLeftInner_y',
  'eyeRightOuter_x', 'eyeRightOuter_y', 'eyeRightInner_x', 'eyeRightInner_y'
];

const categorizeHeadPose = (pitch, yaw) => {
  if (Math.abs(yaw) < 10 && Math.abs(pitch) < 10) {
    return 'forward';
  } else if (pitch < -10) {
    return 'down';
  } else if (yaw > 10) {
    return 'right';
  } else if (yaw < -10) {
    return 'left';
  } else {
    return 'unknown';
  }
};

function FaceDetection() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [attention, setAttention] = useState(null);

  const location = useLocation();
  const contentUrl = location.state?.content || '';

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      startVideo();
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('playing', faceMyDetect);
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });

    videoRef.current.addEventListener('playing', faceMyDetect);
  };

  const faceMyDetect = async () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.innerHTML = '';
    canvasRef.current.append(canvas);
    faceapi.matchDimensions(canvas, {
      width: 940,
      height: 650
    });

    const intervalId = setInterval(async () => {
      try {
        const detections = await faceapi.detectAllFaces(videoRef.current,
          new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, {
          width: 940,
          height: 650
        });

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (resizedDetections.length > 0) {
          const face = resizedDetections[0];
          const landmarks = face.landmarks.positions;

          // Head pose calculations
          const nose = landmarks[30];
          const leftEye = landmarks[36];
          const rightEye = landmarks[45];
          const jaw = landmarks[8];

          const pose = {
            x: (rightEye.x + leftEye.x) / 2 - nose.x,
            y: jaw.y - nose.y,
            down: jaw.y - nose.y,
            forward: (jaw.y + nose.y) / 2 - nose.y,
            left: leftEye.x - nose.x,
            right: nose.x - rightEye.x,
          };

          const poseCategory = categorizeHeadPose(pose.y, pose.x);

          const features = {
            pose_x: pose.x,
            pose_y: pose.y,
            pose_down: poseCategory === 'down' ? 1 : 0,
            pose_forward: poseCategory === 'forward' ? 1 : 0,
            pose_left: poseCategory === 'left' ? 1 : 0,
            pose_right: poseCategory === 'right' ? 1 : 0,
            pupilLeft_x: landmarks[36]?.x || 0,
            pupilLeft_y: landmarks[36]?.y || 0,
            pupilRight_x: landmarks[45]?.x || 0,
            pupilRight_y: landmarks[45]?.y || 0,
            eyeLeftOuter_x: landmarks[36]?.x || 0,
            eyeLeftOuter_y: landmarks[36]?.y || 0,
            eyeLeftInner_x: landmarks[39]?.x || 0,
            eyeLeftInner_y: landmarks[39]?.y || 0,
            eyeRightOuter_x: landmarks[42]?.x || 0,
            eyeRightOuter_y: landmarks[42]?.y || 0,
            eyeRightInner_x: landmarks[45]?.x || 0,
            eyeRightInner_y: landmarks[45]?.y || 0
          };

          const featuresArray = features_to_keep.map(f => features[f] || 0);

          try {
            const response = await axios.post('http://127.0.0.1:5000/api/predict', {
              features: featuresArray
            });

            setAttention(response.data.attention);

          } catch (error) {
            console.error('Error making prediction:', error);
          }
        }
      } catch (error) {
        console.error('Error detecting faces:', error);
      }
    }, 100);

    return () => clearInterval(intervalId);
  };

  const cardStyle = {
    backgroundColor: attention === true ? 'lightgreen' : attention === false ? 'lightcoral' : 'white',
    transition: 'background-color 0.3s ease'
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card className="content-card" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Educational Content
            </Typography>
            {contentUrl.endsWith('.pdf') ? (
              <iframe src={contentUrl} style={{ width: '100%', height: '500px' }} />
            ) : (
              <video controls src={contentUrl} style={{ width: '100%' }} />
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card className="canvas-card" sx={{ height: '100%' }} style={cardStyle}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Face Detection
            </Typography>
            <div className="app-container">
              <div className="appvide">
                <video crossOrigin="anonymous" ref={videoRef} autoPlay width="100%" height="auto" />
              </div>
              <div ref={canvasRef} className="appcanvas" />
              <div className="face-data">
                <Typography variant="h6">Attention: {attention === true ? 'Attentive' : attention === false ? 'Not Attentive' : 'Unknown'}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default FaceDetection;
