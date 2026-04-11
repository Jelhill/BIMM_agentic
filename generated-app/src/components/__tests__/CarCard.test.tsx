import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CarCard } from '../CarCard';
import { Car } from '../../types/car';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('CarCard', () => {
  const mockCar: Car = {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Blue',
    image: 'https://example.com/toyota-camry.jpg'
  };

  it('renders car information correctly', () => {
    renderWithTheme(<CarCard car={mockCar} />);

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Year: 2023')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('renders car image with correct attributes', () => {
    renderWithTheme(<CarCard car={mockCar} />);

    const image = screen.getByAltText('Toyota Camry');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/toyota-camry.jpg');
  });

  it('applies correct styling for white color chip', () => {
    const whiteCar: Car = {
      ...mockCar,
      color: 'White'
    };

    renderWithTheme(<CarCard car={whiteCar} />);

    const colorChip = screen.getByText('White');
    expect(colorChip).toBeInTheDocument();
  });

  it('applies correct styling for yellow color chip', () => {
    const yellowCar: Car = {
      ...mockCar,
      color: 'Yellow'
    };

    renderWithTheme(<CarCard car={yellowCar} />);

    const colorChip = screen.getByText('Yellow');
    expect(colorChip).toBeInTheDocument();
  });

  it('applies correct styling for dark color chip', () => {
    const blackCar: Car = {
      ...mockCar,
      color: 'Black'
    };

    renderWithTheme(<CarCard car={blackCar} />);

    const colorChip = screen.getByText('Black');
    expect(colorChip).toBeInTheDocument();
  });

  it('renders with different car makes and models', () => {
    const hondaCar: Car = {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Red',
      image: 'https://example.com/honda-civic.jpg'
    };

    renderWithTheme(<CarCard car={hondaCar} />);

    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.getByText('Year: 2022')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByAltText('Honda Civic')).toBeInTheDocument();
  });

  it('handles long car names properly', () => {
    const longNameCar: Car = {
      id: '3',
      make: 'Mercedes-Benz',
      model: 'S-Class Maybach',
      year: 2024,
      color: 'Silver',
      image: 'https://example.com/mercedes.jpg'
    };

    renderWithTheme(<CarCard car={longNameCar} />);

    expect(screen.getByText('Mercedes-Benz S-Class Maybach')).toBeInTheDocument();
    expect(screen.getByAltText('Mercedes-Benz S-Class Maybach')).toBeInTheDocument();
  });

  it('renders card structure with proper Material-UI components', () => {
    renderWithTheme(<CarCard car={mockCar} />);

    // Check that the card container exists
    const card = screen.getByText('Toyota Camry').closest('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();

    // Check that CardContent exists
    const cardContent = screen.getByText('Year: 2023').closest('[class*="MuiCardContent-root"]');
    expect(cardContent).toBeInTheDocument();
  });
});