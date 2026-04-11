import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { Car } from '../types/car';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        sx={{
          height: { xs: 180, sm: 200, md: 240 },
          objectFit: 'cover',
        }}
        image={car.image}
        alt={`${car.make} ${car.model}`}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {car.make} {car.model}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Year: {car.year}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Color:
          </Typography>
          <Chip
            label={car.color}
            size="small"
            sx={{
              backgroundColor: car.color.toLowerCase(),
              color: car.color.toLowerCase() === 'white' || car.color.toLowerCase() === 'yellow' ? 'black' : 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};