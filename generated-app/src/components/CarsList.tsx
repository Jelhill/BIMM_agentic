import React from 'react';
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { useCars } from '../hooks/useCars';
import CarCard from './CarCard';

const CarsList: React.FC = () => {
  const { cars, loading, error } = useCars();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (cars.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography variant="h6" color="text.secondary">
            No cars found. Add some cars to get started!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {cars.map((car) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={car.id}
            >
              <CarCard car={car} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CarsList;