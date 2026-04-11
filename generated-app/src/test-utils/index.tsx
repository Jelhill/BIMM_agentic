import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import type { Car } from '../types/car';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mocks?: MockedResponse[];
}

const AllTheProviders = ({
  children,
  mocks = [],
}: {
  children: React.ReactNode;
  mocks?: MockedResponse[];
}) => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  { mocks = [], ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders mocks={mocks}>{children}</AllTheProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export const mockCar: Car = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  color: 'Silver',
  image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
};

export const mockCars: Car[] = [
  mockCar,
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
  },
];

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
