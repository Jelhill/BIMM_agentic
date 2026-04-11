import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { useCars } from '../useCars';
import { GET_CARS, ADD_CAR } from '../../apollo/queries';
import { vi } from 'vitest';

const mockCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 25000,
    available: true,
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    available: true,
  },
];

const createWrapper = (mocks: any[] = []) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useCars', () => {
  it('should return loading state initially', () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: mockCars },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should return cars data after successful fetch', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: mockCars },
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
    expect(result.current.error).toBeUndefined();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch cars';
    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
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
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe(errorMessage);
  });

  it('should add car successfully', async () => {
    const newCar = {
      id: '3',
      make: 'Ford',
      model: 'Mustang',
      year: 2023,
      price: 35000,
      available: true,
    };

    const newCarInput = {
      make: 'Ford',
      model: 'Mustang',
      year: 2023,
      price: 35000,
    };

    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: mockCars },
        },
      },
      {
        request: {
          query: ADD_CAR,
          variables: { input: newCarInput },
        },
        result: {
          data: { createCar: newCar },
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

    expect(result.current.cars).toEqual(mockCars);
  });

  it('should handle add car error', async () => {
    const newCarInput = {
      make: 'Ford',
      model: 'Mustang',
      year: 2023,
      price: 35000,
    };

    const errorMessage = 'Failed to add car';
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: mockCars },
        },
      },
      {
        request: {
          query: ADD_CAR,
          variables: { input: newCarInput },
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

    await expect(result.current.addCar(newCarInput)).rejects.toThrow(errorMessage);
    expect(consoleSpy).toHaveBeenCalledWith('Error adding car:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should provide refetch function', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: mockCars },
        },
      },
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: [...mockCars, { id: '3', make: 'BMW', model: 'X5', year: 2023, price: 45000, available: true }] },
        },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toHaveLength(2);
    expect(typeof result.current.refetch).toBe('function');

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.cars).toHaveLength(3);
    });
  });

  it('should return empty array when no cars data', async () => {
    const mocks = [
      {
        request: {
          query: GET_CARS,
          variables: { limit: 100, offset: 0 },
        },
        result: {
          data: { cars: null },
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
  });
});