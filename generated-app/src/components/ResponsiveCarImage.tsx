import React from 'react';
import { CardMedia, useMediaQuery } from '@mui/material';
import { Car } from '@/types';

interface ResponsiveCarImageProps {
  car: Car;
  alt?: string;
  height?: number | string;
}

const ResponsiveCarImage: React.FC<ResponsiveCarImageProps> = ({
  car,
  alt,
  height = 200
}) => {
  const isMobile = useMediaQuery('(max-width:640px)');
  const isTablet = useMediaQuery('(min-width:641px) and (max-width:1023px)');
  const isDesktop = useMediaQuery('(min-width:1024px)');

  const getImageSrc = (): string => {
    if (isMobile) {
      return car.mobileImage;
    } else if (isTablet) {
      return car.tabletImage;
    } else if (isDesktop) {
      return car.desktopImage;
    }
    return car.desktopImage; // fallback
  };

  const altText = alt || `${car.year} ${car.make} ${car.model} in ${car.color}`;

  return (
    <CardMedia
      component="img"
      height={height}
      image={getImageSrc()}
      alt={altText}
      sx={{
        objectFit: 'cover',
        width: '100%'
      }}
    />
  );
};

export default ResponsiveCarImage;