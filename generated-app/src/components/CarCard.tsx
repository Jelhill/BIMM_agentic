import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import ResponsiveCarImage from '@/components/ResponsiveCarImage';
import { Car } from '@/types';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <Card sx={{ maxWidth: 400, margin: 2 }}>
      <ResponsiveCarImage car={car} height={200} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {car.make} {car.model}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {car.year}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Color:
          </Typography>
          <Chip 
            label={car.color} 
            size="small" 
            sx={{ 
              backgroundColor: car.color.toLowerCase(),
              color: car.color.toLowerCase() === 'yellow' || car.color.toLowerCase() === 'white' ? 'black' : 'white',
              fontWeight: 'bold'
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarCard;