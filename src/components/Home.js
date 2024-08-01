import React from 'react';
import { Button, Card, CardContent, Typography, CardMedia, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container className="home-container">
      <Card className="welcome-card">
        <CardContent className="welcome-content">
          <Typography variant="h3" component="h3" className="welcome-title">
            Welcome to Our Learning Platform
          </Typography>
          <Typography variant="h5" component="h5" className="welcome-subtitle">
            We provide free education for everyone. Our mission is to make learning accessible and enjoyable for all.
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/courses" className="discover-button">
            Discover our courses
          </Button>
        </CardContent>
      </Card>
      <Card className="showcase-card">
        <CardMedia
          component="img"
          height="auto"
          image="./banner.jpg"
          alt="Educational Banner"
          className="showcase-image"
        />
      </Card>
    </Container>
  );
};

export default Home;
