import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CarsList } from '../CarsList';
import type { Car } from '../../types/car';

const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    image: 'https://example.com/camry.jpg',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Blue',
    image: 'https://example.com/civic.jpg',
  },
];

describe('CarsList', () => {
  it('renders car cards for each car', () => {
    render(<CarsList cars={mockCars} />);

    expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument();
    expect(screen.getByText(/Honda Civic/)).toBeInTheDocument();
  });

  it('renders nothing when cars array is empty', () => {
    const { container } = render(<CarsList cars={[]} />);
    expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(0);
  });

  it('renders the correct number of cards', () => {
    render(<CarsList cars={mockCars} />);
    const cards = screen.getAllByText(/Color:/);
    expect(cards).toHaveLength(2);
  });
});
