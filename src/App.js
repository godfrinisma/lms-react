import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Courses from './components/Courses'
import FaceDetection from './components/FaceDetection';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/face-detection" element={<FaceDetection />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
