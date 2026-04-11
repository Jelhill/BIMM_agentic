import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchAndSort from '../SearchAndSort';
import { Car } from '../../types/car';

const mockCars: Car[] = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2020, price: 25000, status: 'available' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2019, price: 22000, status: 'available' },
  { id: '3', make: 'Ford', model: 'Mustang', year: 2021, price: 35000, status: 'available' },
  { id: '4', make: 'BMW', model: 'X3', year: 2022, price: 45000, status: 'available' },
  { id: '5', make: 'Audi', model: 'A4', year: 2018, price: 30000, status: 'available' },
];

describe('SearchAndSort', () => {
  const mockOnFilteredCarsChange = vi.fn();

  beforeEach(() => {
    mockOnFilteredCarsChange.mockClear();
  });

  it('renders search input and sort controls', () => {
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    expect(screen.getByLabelText(/search by model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /newest first/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oldest first/i })).toBeInTheDocument();
  });

  it('filters cars by model name (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'camry');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenCalledWith([
        { id: '1', make: 'Toyota', model: 'Camry', year: 2020, price: 25000, status: 'available' }
      ]);
    });
  });

  it('filters cars with case-insensitive partial match', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'c');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ model: 'Camry' }),
          expect.objectContaining({ model: 'Civic' })
        ])
      );
    });
  });

  it('returns empty array when no cars match search', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(mockOnFilteredCarsChange).toHaveBeenCalledWith([]);
    });
  });

  it('sorts by year descending by default', async () => {
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      expect(sortedCars[0].year).toBe(2022); // BMW X3
      expect(sortedCars[1].year).toBe(2021); // Ford Mustang
      expect(sortedCars[2].year).toBe(2020); // Toyota Camry
      expect(sortedCars[3].year).toBe(2019); // Honda Civic
      expect(sortedCars[4].year).toBe(2018); // Audi A4
    });
  });

  it('sorts by year ascending when direction is changed', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    const oldestFirstButton = screen.getByRole('button', { name: /oldest first/i });
    await user.click(oldestFirstButton);

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      expect(sortedCars[0].year).toBe(2018); // Audi A4
      expect(sortedCars[1].year).toBe(2019); // Honda Civic
      expect(sortedCars[2].year).toBe(2020); // Toyota Camry
      expect(sortedCars[3].year).toBe(2021); // Ford Mustang
      expect(sortedCars[4].year).toBe(2022); // BMW X3
    });
  });

  it('sorts by make alphabetically when sort field is changed', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    // Change sort field to make
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);
    await user.click(screen.getByRole('option', { name: /make/i }));

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      expect(sortedCars[0].make).toBe('Toyota'); // Z-A by default
      expect(sortedCars[1].make).toBe('Honda');
      expect(sortedCars[2].make).toBe('Ford');
      expect(sortedCars[3].make).toBe('BMW');
      expect(sortedCars[4].make).toBe('Audi');
    });
  });

  it('sorts by make A-Z when direction is changed to ascending', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    // Change sort field to make
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);
    await user.click(screen.getByRole('option', { name: /make/i }));

    // Change direction to ascending
    const azButton = screen.getByRole('button', { name: /a-z/i });
    await user.click(azButton);

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      expect(sortedCars[0].make).toBe('Audi');
      expect(sortedCars[1].make).toBe('BMW');
      expect(sortedCars[2].make).toBe('Ford');
      expect(sortedCars[3].make).toBe('Honda');
      expect(sortedCars[4].make).toBe('Toyota');
    });
  });

  it('combines search and sort functionality', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    // Search for cars with 'a' in model name
    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'a');

    // Change sort to ascending by year
    const oldestFirstButton = screen.getByRole('button', { name: /oldest first/i });
    await user.click(oldestFirstButton);

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      
      // Should contain cars with 'a' in model name (Camry, Mustang, A4)
      expect(sortedCars).toHaveLength(3);
      expect(sortedCars.every(car => car.model.toLowerCase().includes('a'))).toBe(true);
      
      // Should be sorted by year ascending
      expect(sortedCars[0].year).toBe(2018); // A4
      expect(sortedCars[1].year).toBe(2020); // Camry
      expect(sortedCars[2].year).toBe(2021); // Mustang
    });
  });

  it('updates sort button labels when sort field changes', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    // Initially should show year labels
    expect(screen.getByRole('button', { name: /newest first/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oldest first/i })).toBeInTheDocument();

    // Change to make sorting
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);
    await user.click(screen.getByRole('option', { name: /make/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /z-a/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /a-z/i })).toBeInTheDocument();
    });
  });

  it('clears search and returns all cars when search input is cleared', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort cars={mockCars} onFilteredCarsChange={mockOnFilteredCarsChange} />);

    // Search first
    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'camry');

    // Clear search
    await user.clear(searchInput);

    await waitFor(() => {
      const lastCall = mockOnFilteredCarsChange.mock.calls[mockOnFilteredCarsChange.mock.calls.length - 1];
      const sortedCars = lastCall[0];
      expect(sortedCars).toHaveLength(mockCars.length);
    });
  });
});