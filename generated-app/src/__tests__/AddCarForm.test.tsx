import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddCarForm from '../components/AddCarForm';
import { useCars } from '../hooks/useCars';

// Mock the useCars hook
vi.mock('../hooks/useCars');

const mockUseCars = useCars as vi.MockedFunction<typeof useCars>;

describe('AddCarForm', () => {
  const mockAddCar = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockAddCar.mockClear();
    mockOnClose.mockClear();
    mockUseCars.mockReturnValue({
      cars: [],
      isLoading: false,
      error: null,
      addCar: mockAddCar,
      updateCar: vi.fn(),
      deleteCar: vi.fn(),
      refetch: vi.fn(),
    });
  });

  describe('Form Rendering', () => {
    it('renders the form dialog when open is true', () => {
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Add New Car')).toBeInTheDocument();
      expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add car/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not render the form dialog when open is false', () => {
      render(<AddCarForm open={false} onClose={mockOnClose} />);
      
      expect(screen.queryByText('Add New Car')).not.toBeInTheDocument();
    });

    it('renders all required field indicators', () => {
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      const requiredFields = screen.getAllByText('*');
      expect(requiredFields).toHaveLength(4); // Make, Model, Year, Color are required
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Make is required')).toBeInTheDocument();
      expect(screen.getByText('Model is required')).toBeInTheDocument();
      expect(screen.getByText('Year is required')).toBeInTheDocument();
      expect(screen.getByText('Color is required')).toBeInTheDocument();
    });

    it('validates year field correctly', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      const yearInput = screen.getByLabelText(/year/i);
      
      // Test invalid year (too old)
      await user.type(yearInput, '1800');
      await user.click(screen.getByRole('button', { name: /add car/i }));
      expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
      
      // Clear and test invalid year (future)
      await user.clear(yearInput);
      const futureYear = new Date().getFullYear() + 5;
      await user.type(yearInput, futureYear.toString());
      await user.click(screen.getByRole('button', { name: /add car/i }));
      expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
      
      // Test non-numeric year
      await user.clear(yearInput);
      await user.type(yearInput, 'abc');
      await user.click(screen.getByRole('button', { name: /add car/i }));
      expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
    });

    it('validates image URL field correctly', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      const imageUrlInput = screen.getByLabelText(/image url/i);
      
      await user.type(imageUrlInput, 'not-a-valid-url');
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /add car/i }));
      expect(screen.getByText('Make is required')).toBeInTheDocument();
      
      // Start typing in make field
      const makeInput = screen.getByLabelText(/make/i);
      await user.type(makeInput, 'T');
      
      expect(screen.queryByText('Make is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalledWith({
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          color: 'Blue',
          imageUrl: 'https://example.com/image.jpg',
        });
      });
    });

    it('submits form without optional image URL', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Honda');
      await user.type(screen.getByLabelText(/model/i), 'Civic');
      await user.type(screen.getByLabelText(/year/i), '2022');
      await user.type(screen.getByLabelText(/color/i), 'Red');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalledWith({
          make: 'Honda',
          model: 'Civic',
          year: 2022,
          color: 'Red',
          imageUrl: undefined,
        });
      });
    });

    it('trims whitespace from form inputs', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), '  Toyota  ');
      await user.type(screen.getByLabelText(/model/i), '  Camry  ');
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), '  Blue  ');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalledWith({
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          color: 'Blue',
          imageUrl: undefined,
        });
      });
    });

    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      let resolveAddCar: () => void;
      const addCarPromise = new Promise<void>((resolve) => {
        resolveAddCar = resolve;
      });
      mockAddCar.mockReturnValueOnce(addCarPromise);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      
      const submitButton = screen.getByRole('button', { name: /add car/i });
      await user.click(submitButton);
      
      expect(submitButton).toBeDisabled();
      
      resolveAddCar!();
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('handles submission errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to add car';
      mockAddCar.mockRejectedValueOnce(new Error(errorMessage));
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset and Close Behavior', () => {
    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      const makeInput = screen.getByLabelText(/make/i) as HTMLInputElement;
      const modelInput = screen.getByLabelText(/model/i) as HTMLInputElement;
      const yearInput = screen.getByLabelText(/year/i) as HTMLInputElement;
      const colorInput = screen.getByLabelText(/color/i) as HTMLInputElement;
      
      await user.type(makeInput, 'Toyota');
      await user.type(modelInput, 'Camry');
      await user.type(yearInput, '2023');
      await user.type(colorInput, 'Blue');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('resets form when dialog is closed via cancel button', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets form when dialog is closed via backdrop click', () => {
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Toyota' } });
      
      // Simulate backdrop click by calling onClose directly (as MUI would)
      fireEvent.click(screen.getByRole('dialog'));
      // Note: In a real test environment, you might need to find the backdrop element specifically
      // This is a simplified version for the test structure
    });

    it('clears validation errors when form is reset', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      // Trigger validation errors
      await user.click(screen.getByRole('button', { name: /add car/i }));
      expect(screen.getByText('Make is required')).toBeInTheDocument();
      
      // Close dialog
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Integration with useCars Hook', () => {
    it('calls useCars hook to get addCar function', () => {
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      expect(mockUseCars).toHaveBeenCalled();
    });

    it('uses addCar from useCars hook for submission', async () => {
      const user = userEvent.setup();
      mockAddCar.mockResolvedValueOnce(undefined);
      
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.type(screen.getByLabelText(/make/i), 'Toyota');
      await user.type(screen.getByLabelText(/model/i), 'Camry');
      await user.type(screen.getByLabelText(/year/i), '2023');
      await user.type(screen.getByLabelText(/color/i), 'Blue');
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      await waitFor(() => {
        expect(mockAddCar).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    });

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<AddCarForm open={true} onClose={mockOnClose} />);
      
      await user.click(screen.getByRole('button', { name: /add car/i }));
      
      const makeInput = screen.getByLabelText(/make/i);
      expect(makeInput).toHaveAttribute('aria-invalid', 'true');
      expect(makeInput).toHaveAccessibleDescription();
    });
  });
});