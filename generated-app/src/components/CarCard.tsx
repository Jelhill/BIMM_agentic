import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Car } from '../types/Car';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getCardHeight = () => {
    if (isMobile) return 280;
    if (isTablet) return 320;
    return 360;
  };

  const getImageHeight = () => {
    if (isMobile) return 140;
    if (isTablet) return 160;
    return 200;
  };

  return (
    <Card
      sx={{
        height: getCardHeight(),
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardMedia
        component="img"
        height={getImageHeight()}
        image={car.image}
        alt={`${car.make} ${car.model}`}
        sx={{
          objectFit: 'cover',
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: isMobile ? 1.5 : 2,
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {car.make} {car.model}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          {car.year}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Chip
            label={car.color}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              backgroundColor: car.color.toLowerCase(),
              color: getContrastColor(car.color),
              fontWeight: 500,
              '&:hover': {
                backgroundColor: car.color.toLowerCase(),
                opacity: 0.8,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const getContrastColor = (hexColor: string): string => {
  const colorMap: { [key: string]: string } = {
    red: '#ffffff',
    blue: '#ffffff',
    green: '#ffffff',
    black: '#ffffff',
    white: '#000000',
    yellow: '#000000',
    orange: '#000000',
    purple: '#ffffff',
    pink: '#000000',
    gray: '#ffffff',
    grey: '#ffffff',
    silver: '#000000',
    brown: '#ffffff',
  };

  const normalizedColor = hexColor.toLowerCase();
  return colorMap[normalizedColor] || '#ffffff';
};

export default CarCard;