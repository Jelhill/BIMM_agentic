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
  onClick?: () => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const getColorChipStyle = (color: string) => ({
    backgroundColor: color.toLowerCase(),
    color: getContrastColor(color),
    minWidth: '60px',
  });

  const getContrastColor = (hexColor: string): string => {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        sx={{
          height: { xs: 200, sm: 240, md: 280 },
          objectFit: 'cover',
        }}
        image={car.image || '/api/placeholder/400/300'}
        alt={`${car.year} ${car.make} ${car.model}`}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          {car.year} {car.make} {car.model}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: 1 }}
          >
            Color:
          </Typography>
          <Chip
            label={car.color}
            size="small"
            sx={getColorChipStyle(car.color)}
          />
        </Box>
      </CardContent>
    </Card>
  );
};