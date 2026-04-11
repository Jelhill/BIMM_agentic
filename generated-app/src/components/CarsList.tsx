import React from 'react';
import Grid from '@mui/material/Grid2';
import { CarCard } from './CarCard';
import type { Car } from '../types/car';

interface CarsListProps {
  cars: Car[];
}

export const CarsList: React.FC<CarsListProps> = ({ cars }) => {
  return (
    <Grid container spacing={3}>
      {cars.map((car) => (
        <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <CarCard car={car} />
        </Grid>
      ))}
    </Grid>
  );
};
