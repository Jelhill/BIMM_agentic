import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_CARS, ADD_CAR } from '@/graphql/queries';
import { useCars } from '@/hooks/useCars';
import { Car, CarInput } from '@/types';
import { ReactNode } from 'react';

const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Blue',
    mobileImage: 'mobile1.jpg',
    tabletImage: 'tablet1.jpg',
    desktopImage: 'desktop1.jpg',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    color: 'Red',
    mobileImage: 'mobile2.jpg',
    tabletImage: 'tablet2.jpg',
    desktopImage: 'desktop2.jpg',
  },
];

const newCar: Car = {
  id: '3',
  make: 'Ford',
  model: 'Mustang',
  year: 2024,
  color: 'Yellow',
  mobileImage: 'mobile3.jpg',
  tabletImage: 'tablet3.jpg',
  desktopImage: 'desktop3.jpg',
};

const newCarInput: CarInput = {
  make: 'Ford',
  model: 'Mustang',
  year: 2024,
  color: 'Yellow',
  mobileImage: 'mobile3.jpg',
  tabletImage: 'tablet3.jpg',
  desktopImage: 'desktop3.jpg',
};

describe('useCars', () => {
  const createWrapper = (mocks: any[]) => {
    return ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  };

  it('should return loading state initially', () => {
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

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch cars successfully', async () => {
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

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle error when fetching cars fails', async () => {
    const errorMock = new Error('Failed to fetch cars');
    const mocks = [
      {
        request: {
          query: GET_CARS,
        },
        error: errorMock,
      },
    ];

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should add a new car and update cache', async () => {
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

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);

    await result.current.addCar(newCarInput);

    await waitFor(() => {
      expect(result.current.cars).toEqual([...mockCars, newCar]);
    });
  });

  it('should handle addCar mutation error', async () => {
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

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.addCar(newCarInput)).rejects.toThrow('Failed to add car');
  });

  it('should provide refetch function', async () => {
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

    const wrapper = createWrapper(mocks);
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cars).toEqual(mockCars);
    expect(typeof result.current.refetch).toBe('function');

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.cars).toEqual([...mockCars, newCar]);
    });
  });
});