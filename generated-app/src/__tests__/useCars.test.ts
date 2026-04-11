import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { useCars } from '../hooks/useCars';
import { GET_CARS, ADD_CAR } from '../graphql/queries';
import { Car, AddCarInput } from '../types/car';

const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 25000,
    mileage: 15000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: 'White',
    features: ['Air Conditioning', 'Bluetooth'],
    images: ['image1.jpg'],
    description: 'Well maintained Toyota Camry',
    contactInfo: {
      name: 'John Doe',
      phone: '123-456-7890',
      email: 'john@example.com',
    },
    location: 'New York, NY',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    mileage: 20000,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    bodyType: 'Sedan',
    color: 'Black',
    features: ['Backup Camera'],
    images: ['image2.jpg'],
    description: 'Honda Civic in great condition',
    contactInfo: {
      name: 'Jane Smith',
      phone: '987-654-3210',
      email: 'jane@example.com',
    },
    location: 'Los Angeles, CA',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

const newCarInput: AddCarInput = {
  make: 'BMW',
  model: 'X5',
  year: 2023,
  price: 55000,
  mileage: 5000,
  fuelType: 'Gasoline',
  transmission: 'Automatic',
  bodyType: 'SUV',
  color: 'Blue',
  features: ['Navigation', 'Leather Seats'],
  images: ['bmw-image.jpg'],
  description: 'Luxury BMW X5',
  contactInfo: {
    name: 'Mike Johnson',
    phone: '555-123-4567',
    email: 'mike@example.com',
  },
  location: 'Chicago, IL',
};

const newCar: Car = {
  id: '3',
  ...newCarInput,
  createdAt: '2023-01-03T00:00:00Z',
  updatedAt: '2023-01-03T00:00:00Z',
};

const createWrapper = (mocks: any[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useCars', () => {
  it('should return cars data when query succeeds', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: mockCars,
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);
    expect(result.current.error).toBeNull();
  });

  it('should handle query errors', async () => {
    const errorMessage = 'Failed to fetch cars';
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        error: new Error(errorMessage),
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should add car successfully and update cache', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: mockCars,
          },
        },
      },
      {
        request: {
          query: ADD_CAR,
          variables: {
            input: newCarInput,
          },
        },
        result: {
          data: {
            addCar: newCar,
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);

    await result.current.addCar(newCarInput);

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(3);
    });

    expect(result.current.cars).toContainEqual(newCar);
  });

  it('should handle add car mutation errors', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: mockCars,
          },
        },
      },
      {
        request: {
          query: ADD_CAR,
          variables: {
            input: newCarInput,
          },
        },
        error: new Error('Failed to add car'),
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.addCar(newCarInput)).rejects.toThrow('Failed to add car');
  });

  it('should refetch cars data', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: mockCars,
          },
        },
      },
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: [...mockCars, newCar],
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(3);
    });
  });

  it('should handle loading state during query', () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        delay: 100,
        result: {
          data: {
            cars: mockCars,
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when no cars data', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: {
            cars: [],
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle cache update when existing cars is null', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        result: {
          data: null,
        },
      },
      {
        request: {
          query: ADD_CAR,
          variables: {
            input: newCarInput,
          },
        },
        result: {
          data: {
            addCar: newCar,
          },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.addCar(newCarInput);

    expect(result.current.cars).toEqual([]);
  });
});