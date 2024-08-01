import React from 'react';
import ButtonAppBar from './ButtonAppBar';
import { Container } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <>
      <ButtonAppBar />
      <Container
        component="main"
        sx={{ mt: 8, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {children}
      </Container>
    </>
  );
};

export default Layout;
