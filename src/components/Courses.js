import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Container, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPython, faJs, faHtml5 } from '@fortawesome/free-brands-svg-icons';
import { faChartBar, faRobot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const courses = [
  { name: "Introduction to Python", icon: faPython },
  { name: "Advanced JavaScript", icon: faJs },
  { name: "Web Development with Flask", icon: faHtml5 },
  { name: "Data Analysis with Pandas", icon: faChartBar },
  { name: "Machine Learning with Scikit-Learn", icon: faRobot }
];

const CourseContent = ({ courseName, onStartCourse }) => (
  <div className="row">
    <div className="col-md-12 text-center">
      <h1>{courseName}</h1>
      <Button id="startCourseBtn" variant="contained" color="primary" onClick={onStartCourse} sx={{ mt: 3 }}>
        Start Course
      </Button>
    </div>
  </div>
);

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  const handleCourseClick = (courseName) => {
    setSelectedCourse(courseName);
  };

  const handleStartCourse = () => {
    navigate('/face-detection', { state: { content: 'myvid.mp4' } });
  };

  return (
    <Container className="courses-container" sx={{ mt: 5 }}>
      {!selectedCourse && (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.name}>
              <Card className="course-card">
                <CardContent className="course-card-content">
                  <FontAwesomeIcon icon={course.icon} size="3x" />
                  <Typography variant="h5" component="h2" className="course-card-title" sx={{ mt: 2 }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleCourseClick(course.name); }} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {course.name}
                    </a>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {selectedCourse && (
        <CourseContent courseName={selectedCourse} onStartCourse={handleStartCourse} />
      )}
    </Container>
  );
};

export default Courses;
