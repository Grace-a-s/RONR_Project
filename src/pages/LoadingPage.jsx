import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DotLoader } from 'react-spinners';

function LoadingPage() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: 8,
        px: 2,
      }}
    >
      <DotLoader color="#0ba179" size={64} />
    </Box>
  );
}

export default LoadingPage;