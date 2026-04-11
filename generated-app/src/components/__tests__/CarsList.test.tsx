import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { CarsList } from '../CarsList';
import { useCars } from '../../hooks/useCars';

// Mock the useCars hook
vi.mock('../../hooks/useCars');
const mockUseCars = vi.mocked(useCars);

// Mock the CarCard component
vi.mock('../CarCard', () => ({
  CarCard: ({ car }: { car: any }) => (
    <div data-testid={`car-card-${car.id}`}>
      {car.make} {car.model}
    </div>
  ),
}));

const mockCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 25000,
    mileage: 5000,
    color: 'Blue',
    images: ['image1.jpg'],
    description: 'Great car',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 22000,
    mileage: 10000,
    color: 'Red',
    images: ['image2.jpg'],
    description: 'Excellent condition',
  },
];

const renderComponent = () => {
  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <CarsList />
    </MockedProvider>
  );
};

describe('CarsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('displays loading spinner when loading is true', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('No cars found')).not.toBeInTheDocument();
    });

    it('centers the loading spinner vertically', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const loadingContainer = screen.getByRole('progressbar').closest('div');
      expect(loadingContainer).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      });
    });
  });

  describe('Error state', () => {
    it('displays error message when there is an error', () => {
      const errorMessage = 'Failed to fetch cars';
      mockUseCars.mockReturnValue({
        cars: [],
        loading: false,
        error: new Error(errorMessage),
        refetch: vi.fn(),
      });

      renderComponent();

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(`Error loading cars: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays error alert with proper severity', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
      });

      renderComponent();

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardError');
    });
  });

  describe('Empty state', () => {
    it('displays no cars message when cars array is empty', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      expect(screen.getByText('No cars found')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('centers the no cars message', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const messageContainer = screen.getByText('No cars found').closest('div');
      expect(messageContainer).toHaveStyle({
        textAlign: 'center',
      });
    });
  });

  describe('Success state with cars', () => {
    it('renders cars in a grid layout', () => {
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      expect(screen.getByTestId('car-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('car-card-2')).toBeInTheDocument();
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    it('renders correct number of car cards', () => {
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const carCards = screen.getAllByTestId(/car-card-/);
      expect(carCards).toHaveLength(mockCars.length);
    });

    it('passes correct car data to CarCard components', () => {
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      mockCars.forEach((car) => {
        expect(screen.getByTestId(`car-card-${car.id}`)).toBeInTheDocument();
        expect(screen.getByText(`${car.make} ${car.model}`)).toBeInTheDocument();
      });
    });

    it('applies correct grid breakpoints to car cards', () => {
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const gridItems = screen.getAllByTestId(/car-card-/).map(card => card.closest('.MuiGrid-item'));
      
      gridItems.forEach(item => {
        expect(item).toHaveClass('MuiGrid-grid-xs-12');
        expect(item).toHaveClass('MuiGrid-grid-sm-6');
        expect(item).toHaveClass('MuiGrid-grid-md-4');
        expect(item).toHaveClass('MuiGrid-grid-lg-3');
      });
    });

    it('applies proper spacing to grid container', () => {
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const gridContainer = screen.getByTestId('car-card-1').closest('.MuiGrid-container');
      expect(gridContainer).toHaveClass('MuiGrid-spacing-xs-3');
    });
  });

  describe('Integration with useCars hook', () => {
    it('calls useCars hook on component mount', () => {
      mockUseCars.mockReturnValue({
        cars: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      expect(mockUseCars).toHaveBeenCalledTimes(1);
      expect(mockUseCars).toHaveBeenCalledWith();
    });

    it('handles hook state changes correctly', () => {
      const { rerender } = render(
        <MockedProvider mocks={[]} addTypename={false}>
          <CarsList />
        </MockedProvider>
      );

      // Initially loading
      mockUseCars.mockReturnValue({
        cars: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      rerender(
        <MockedProvider mocks={[]} addTypename={false}>
          <CarsList />
        </MockedProvider>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Then loaded with cars
      mockUseCars.mockReturnValue({
        cars: mockCars,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      rerender(
        <MockedProvider mocks={[]} addTypename={false}>
          <CarsList />
        </MockedProvider>
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('car-card-1')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('maintains responsive grid structure with different numbers of cars', () => {
      const singleCar = [mockCars[0]];
      
      mockUseCars.mockReturnValue({
        cars: singleCar,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderComponent();

      const gridItem = screen.getByTestId('car-card-1').closest('.MuiGrid-item');
      expect(gridItem).toHaveClass('MuiGrid-grid-xs-12');
      expect(gridItem).toHaveClass('MuiGrid-grid-sm-6');
      expect(gridItem).toHaveClass('MuiGrid-grid-md-4');
      expect(gridItem).toHaveClass('MuiGrid-grid-lg-3');
    });
  });
});