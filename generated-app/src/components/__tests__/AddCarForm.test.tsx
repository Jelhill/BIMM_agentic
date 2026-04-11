import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddCarForm } from '../AddCarForm';

const mockAddCar = vi.fn();
vi.mock('../../hooks/useCars', () => ({
  useCars: () => ({
    addCar: mockAddCar,
  }),
}));

function renderForm() {
  return render(<AddCarForm />);
}

describe('AddCarForm', () => {
  beforeEach(() => {
    mockAddCar.mockClear();
  });

  it('renders all form fields', () => {
    renderForm();

    expect(screen.getByLabelText(/^Make/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Model/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Year/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Color/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image URL/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add car/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockAddCar.mockResolvedValue(undefined);
    renderForm();

    await user.type(screen.getByLabelText(/^Make/), 'Toyota');
    await user.type(screen.getByLabelText(/^Model/), 'Camry');
    await user.type(screen.getByLabelText(/^Year/), '2022');
    await user.type(screen.getByLabelText(/^Color/), 'Silver');

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(mockAddCar).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        image: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Car added successfully!')).toBeInTheDocument();
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    mockAddCar.mockResolvedValue(undefined);
    renderForm();

    const makeInput = screen.getByLabelText(/^Make/);
    await user.type(makeInput, 'Honda');
    await user.type(screen.getByLabelText(/^Model/), 'Civic');
    await user.type(screen.getByLabelText(/^Year/), '2023');
    await user.type(screen.getByLabelText(/^Color/), 'Blue');

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(makeInput).toHaveValue('');
    });
  });

  it('does not submit when addCar rejects', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAddCar.mockRejectedValue(new Error('Network error'));
    renderForm();

    await user.type(screen.getByLabelText(/^Make/), 'Toyota');
    await user.type(screen.getByLabelText(/^Model/), 'Camry');
    await user.type(screen.getByLabelText(/^Year/), '2022');
    await user.type(screen.getByLabelText(/^Color/), 'Silver');

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(mockAddCar).toHaveBeenCalled();
    });

    // Form should not be cleared on error
    await waitFor(() => {
      expect(screen.getByLabelText(/^Make/)).toHaveValue('Toyota');
    });

    consoleSpy.mockRestore();
  });
});
