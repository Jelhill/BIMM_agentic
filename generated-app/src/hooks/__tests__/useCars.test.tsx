import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { describe, it, expect } from 'vitest';
import { useCars } from '../useCars';
import { GET_CARS } from '../../graphql/queries';

const mockCars = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2022, color: 'Silver', image: 'https://example.com/camry.jpg' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2023, color: 'Blue', image: 'https://example.com/civic.jpg' },
];

function createWrapper(mocks: MockedResponse[]) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename>
        {children}
      </MockedProvider>
    );
  };
}

describe('useCars', () => {
  it('returns loading state initially', () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CARS },
        result: { data: { cars: mockCars } },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.cars).toEqual([]);
  });

  it('returns cars after loading', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CARS },
        result: { data: { cars: mockCars } },
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

  it('handles query error', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CARS },
        error: new Error('Network error'),
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.cars).toEqual([]);
  });

  it('provides addCar and refetch functions', () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CARS },
        result: { data: { cars: mockCars } },
      },
    ];

    const { result } = renderHook(() => useCars(), {
      wrapper: createWrapper(mocks),
    });

    expect(typeof result.current.addCar).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });
});
