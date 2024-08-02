// src/components/Home.js

import React from 'react';
import { Button, Card, CardContent, Typography, CardMedia, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      {/* Welcome Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
        }}
      >
        <CardContent>
          <Typography variant="h3" component="h3" sx={{ mb: 2, color: '#333' }}>
            Welcome to Our Learning Platform
          </Typography>
          <Typography variant="h5" component="h5" sx={{ mb: 3, color: '#555' }}>
            We provide free education for everyone. Our mission is to make learning accessible and enjoyable for all.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/courses"
            sx={{
              fontSize: '1.1rem',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
            }}
          >
            Discover our courses
          </Button>
        </CardContent>
      </Card>

      {/* Showcase Card */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="400"
          image="./banner1.jpg"
          alt="Educational Banner"
          sx={{
            objectFit: 'cover',
            borderRadius: 'inherit',
          }}
        />
        <CardContent sx={{ textAlign: 'center', backgroundColor: '#fff' }}>
          <Typography variant="h6" sx={{ mt: 2, color: '#777' }}>
            Explore a variety of courses across different fields and enhance your knowledge today.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home;
