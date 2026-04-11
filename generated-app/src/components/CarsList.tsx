import React from 'react';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { useCars } from '../hooks/useCars';
import { CarCard } from './CarCard';

export const CarsList: React.FC = () => {
  const { cars, loading, error } = useCars();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error loading cars: {error.message}
        </Alert>
      </Box>
    );
  }

  if (cars.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No cars found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {cars.map((car) => (
          <Grid 
            item 
            key={car.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <CarCard car={car} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};