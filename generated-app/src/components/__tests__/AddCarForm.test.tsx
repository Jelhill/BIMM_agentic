import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AddCarForm } from '../AddCarForm';
import { useCars } from '../../hooks/useCars';

// Mock the useCars hook
vi.mock('../../hooks/useCars');
const mockUseCars = vi.mocked(useCars);

describe('AddCarForm', () => {
  const mockAddCar = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockUseCars.mockReturnValue({
      cars: [],
      isLoading: false,
      error: null,
      addCar: mockAddCar,
      updateCar: vi.fn(),
      deleteCar: vi.fn(),
      refreshCars: vi.fn(),
    });
    
    mockAddCar.mockClear();
    mockOnClose.mockClear();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      open: true,
      onClose: mockOnClose,
    };
    
    return render(<AddCarForm {...defaultProps} {...props} />);
  };

  describe('rendering', () => {
    it('should render the form when open', () => {
      renderComponent();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Car')).toBeInTheDocument();
      expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add car/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not render the form when closed', () => {
      renderComponent({ open: false });
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should have current year as default year value', () => {
      renderComponent();
      
      const yearInput = screen.getByLabelText(/year/i) as HTMLInputElement;
      expect(yearInput.value).toBe(new Date().getFullYear().toString());
    });
  });

  describe('form validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Make is required')).toBeInTheDocument();
      expect(screen.getByText('Model is required')).toBeInTheDocument();
      expect(screen.getByText('Color is required')).toBeInTheDocument();
      expect(mockAddCar).not.toHaveBeenCalled();
    });

    it('should validate year field', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.clear(yearInput);
      await user.type(yearInput, '1800');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
      expect(mockAddCar).not.toHaveBeenCalled();
    });

    it('should validate future year', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const yearInput = screen.getByLabelText(/year/i);
      const futureYear = new Date().getFullYear() + 2;
      
      await user.clear(yearInput);
      await user.type(yearInput, futureYear.toString());
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
      expect(mockAddCar).not.toHaveBeenCalled();
    });

    it('should validate image URL format', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Fill required fields
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      await user.type(screen.getByLabelText(/image url/i), 'invalid-url');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      expect(mockAddCar).not.toHaveBeenCalled();
    });

    it('should clear validation errors when user types in field', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Make is required')).toBeInTheDocument();
      
      // Type in make field
      const makeInput = screen.getByLabelText(/make/i);
      await user.type(makeInput, 'Toyota');
      
      expect(screen.queryByText('Make is required')).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      renderComponent();
      
      // Fill all fields
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.clear(screen.getByLabelText(/year/i));
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/car.jpg');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalledWith({
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          color: 'Blue',
          imageUrl: 'https://example.com/car.jpg',
        });
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should submit form without optional image URL', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      renderComponent();
      
      // Fill required fields only
      await user.type(screen.getByLabelText(/make/i), 'Honda');
      await user.type(screen.getByLabelText(/model/i), 'Civic');
      await user.type(screen.getByLabelText(/color/i), 'Red');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalledWith({
          make: 'Honda',
          model: 'Civic',
          year: new Date().getFullYear(),
          color: 'Red',
          imageUrl: '',
        });
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveAddCar: () => void;
      const addCarPromise = new Promise<void>((resolve) => {
        resolveAddCar = resolve;
      });
      mockAddCar.mockReturnValue(addCarPromise);
      
      renderComponent();
      
      // Fill required fields
      await user.type(screen.getByLabelText(/make/i), 'Ford');
      await user.type(screen.getByLabelText(/model/i), 'F-150');
      await user.type(screen.getByLabelText(/color/i), 'Black');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      // Check loading state
      expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adding.../i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      
      // Resolve the promise
      resolveAddCar!();
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();
      const error = new Error('Network error');
      mockAddCar.mockRejectedValueOnce(error);
      
      renderComponent();
      
      // Fill required fields
      await user.type(screen.getByLabelText(/make/i), 'BMW');
      await user.type(screen.getByLabelText(/model/i), 'X5');
      await user.type(screen.getByLabelText(/color/i), 'White');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to add car. Please try again.')).toBeInTheDocument();
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /add car/i })).not.toBeDisabled();
    });
  });

  describe('form cancellation and reset', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when closed', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Fill form
      await user.type(screen.getByLabelText(/make/i), 'Tesla');
      await user.type(screen.getByLabelText(/model/i), 'Model 3');
      
      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      // Reopen dialog
      renderComponent();
      
      // Check form is reset
      expect((screen.getByLabelText(/make/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/model/i) as HTMLInputElement).value).toBe('');
      expect(screen.queryByText('Failed to add car. Please try again.')).not.toBeInTheDocument();
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      renderComponent();
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/make/i), 'Audi');
      await user.type(screen.getByLabelText(/model/i), 'A4');
      await user.type(screen.getByLabelText(/color/i), 'Silver');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
      
      // Verify form would be reset when reopened
      renderComponent();
      expect((screen.getByLabelText(/make/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/model/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/color/i) as HTMLInputElement).value).toBe('');
    });
  });

  describe('year input handling', () => {
    it('should handle non-numeric year input', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.clear(yearInput);
      await user.type(yearInput, 'abc');
      
      // Should default to 0 for invalid input
      expect((yearInput as HTMLInputElement).value).toBe('0');
    });

    it('should accept valid year input', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.clear(yearInput);
      await user.type(yearInput, '2020');
      
      expect((yearInput as HTMLInputElement).value).toBe('2020');
    });
  });
});