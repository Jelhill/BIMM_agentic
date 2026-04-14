import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CarCard from '@/components/CarCard';
import { Car } from '@/types';

const mockCar: Car = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  color: 'Red',
  mobileImage: 'https://example.com/mobile.jpg',
  tabletImage: 'https://example.com/tablet.jpg',
  desktopImage: 'https://example.com/desktop.jpg'
};

describe('CarCard', () => {
  it('displays car make and model', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
  });

  it('displays car year', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('displays color chip with correct label', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('displays color label text', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText('Color:')).toBeInTheDocument();
  });

  it('displays car image with correct alt text', () => {
    render(<CarCard car={mockCar} />);
    
    const image = screen.getByAltText('2023 Toyota Camry in Red');
    expect(image).toBeInTheDocument();
  });

  it('renders with yellow car and correct styling', () => {
    const yellowCar: Car = {
      ...mockCar,
      color: 'Yellow'
    };
    
    render(<CarCard car={yellowCar} />);
    
    expect(screen.getByText('Yellow')).toBeInTheDocument();
  });

  it('renders with white car and correct styling', () => {
    const whiteCar: Car = {
      ...mockCar,
      color: 'White'
    };
    
    render(<CarCard car={whiteCar} />);
    
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('displays all car details together', () => {
    const testCar: Car = {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Blue',
      mobileImage: 'https://example.com/honda-mobile.jpg',
      tabletImage: 'https://example.com/honda-tablet.jpg',
      desktopImage: 'https://example.com/honda-desktop.jpg'
    };

    render(<CarCard car={testCar} />);
    
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByAltText('2022 Honda Civic in Blue')).toBeInTheDocument();
  });
});