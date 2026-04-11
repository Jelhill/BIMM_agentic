import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import CarsList from '../components/CarsList';
import { useCars } from '../hooks/useCars';

// Mock the useCars hook
vi.mock('../hooks/useCars');

// Mock the CarCard component
vi.mock('../components/CarCard', () => ({
  default: ({ car }: { car: any }) => (
    <div data-testid={`car-card-${car.id}`}>
      {car.make} {car.model}
    </div>
  ),
}));

const mockUseCars = useCars as vi.MockedFunction<typeof useCars>;

const mockCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    mileage: 15000,
    price: 25000,
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    bodyType: 'SEDAN',
    color: 'Blue',
    description: 'Great car',
    imageUrls: ['image1.jpg'],
    features: ['Air Conditioning'],
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    mileage: 20000,
    price: 22000,
    fuelType: 'GASOLINE',
    transmission: 'MANUAL',
    bodyType: 'SEDAN',
    color: 'Red',
    description: 'Sporty car',
    imageUrls: ['image2.jpg'],
    features: ['Bluetooth'],
  },
];

describe('CarsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithApolloProvider = (component: React.ReactElement) => {
    return render(
      <MockedProvider mocks={[]} addTypename={false}>
        {component}
      </MockedProvider>
    );
  };

  it('displays loading state', () => {
    mockUseCars.mockReturnValue({
      cars: [],
      loading: true,
      error: null,
    });

    renderWithApolloProvider(<CarsList />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/No cars found/)).not.toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to fetch cars';
    mockUseCars.mockReturnValue({
      cars: [],
      loading: false,
      error: errorMessage,
    });

    renderWithApolloProvider(<CarsList />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('displays empty state when no cars are found', () => {
    mockUseCars.mockReturnValue({
      cars: [],
      loading: false,
      error: null,
    });

    renderWithApolloProvider(<CarsList />);

    expect(screen.getByText('No cars found. Add some cars to get started!')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders cars in grid layout', () => {
    mockUseCars.mockReturnValue({
      cars: mockCars,
      loading: false,
      error: null,
    });

    renderWithApolloProvider(<CarsList />);

    expect(screen.getByTestId('car-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('car-card-2')).toBeInTheDocument();
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders correct number of cars', () => {
    mockUseCars.mockReturnValue({
      cars: mockCars,
      loading: false,
      error: null,
    });

    renderWithApolloProvider(<CarsList />);

    const carCards = screen.getAllByTestId(/^car-card-/);
    expect(carCards).toHaveLength(mockCars.length);
  });

  it('renders with proper container structure', () => {
    mockUseCars.mockReturnValue({
      cars: mockCars,
      loading: false,
      error: null,
    });

    const { container } = renderWithApolloProvider(<CarsList />);

    expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
    expect(container.querySelector('.MuiGrid-container')).toBeInTheDocument();
  });

  it('handles single car correctly', () => {
    const singleCar = [mockCars[0]];
    mockUseCars.mockReturnValue({
      cars: singleCar,
      loading: false,
      error: null,
    });

    renderWithApolloProvider(<CarsList />);

    expect(screen.getByTestId('car-card-1')).toBeInTheDocument();
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.queryByTestId('car-card-2')).not.toBeInTheDocument();
  });
});