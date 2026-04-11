import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SearchAndSort } from '../SearchAndSort';
import type { Car } from '../../types/car';

const mockCars: Car[] = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2022, color: 'Silver' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2023, color: 'Blue' },
  { id: '3', make: 'Ford', model: 'Mustang', year: 2021, color: 'Red' },
  { id: '4', make: 'BMW', model: 'X3', year: 2024, color: 'Black' },
];

describe('SearchAndSort', () => {
  const mockOnFilteredCarsChange = vi.fn();

  beforeEach(() => {
    mockOnFilteredCarsChange.mockClear();
  });

  test('renders search input and sort dropdown', () => {
    render(
      <SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />
    );

    expect(screen.getByPlaceholderText(/search by make or model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  test('filters cars by model (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(
      <SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />
    );

    await user.type(screen.getByPlaceholderText(/search by make or model/i), 'civic');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenCalledWith([
        expect.objectContaining({ make: 'Honda', model: 'Civic' }),
      ]);
    });
  });

  test('default sort is year descending', () => {
    render(
      <SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />
    );

    expect(mockOnFilteredCarsChange).toHaveBeenCalledWith([
      expect.objectContaining({ year: 2024 }),
      expect.objectContaining({ year: 2023 }),
      expect.objectContaining({ year: 2022 }),
      expect.objectContaining({ year: 2021 }),
    ]);
  });

  test('sorts by make ascending', async () => {
    const user = userEvent.setup();
    render(
      <SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />
    );

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'make-asc');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ make: 'BMW' }),
        expect.objectContaining({ make: 'Ford' }),
        expect.objectContaining({ make: 'Honda' }),
        expect.objectContaining({ make: 'Toyota' }),
      ]);
    });
  });

  test('returns empty array when no match', async () => {
    const user = userEvent.setup();
    render(
      <SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />
    );

    await user.type(screen.getByPlaceholderText(/search by make or model/i), 'zzz');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenCalledWith([]);
    });
  });
});
