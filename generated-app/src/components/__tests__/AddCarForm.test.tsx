import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCarForm from '@/components/AddCarForm';

describe('AddCarForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields when open', () => {
    render(<AddCarForm {...defaultProps} />);

    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tablet image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/desktop image url/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddCarForm {...defaultProps} open={false} />);

    expect(screen.queryByText('Add New Car')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add car/i });
    await user.click(addButton);

    expect(screen.getByText('Make is required')).toBeInTheDocument();
    expect(screen.getByText('Model is required')).toBeInTheDocument();
    expect(screen.getByText('Color is required')).toBeInTheDocument();
    expect(screen.getByText('Mobile image URL is required')).toBeInTheDocument();
    expect(screen.getByText('Tablet image URL is required')).toBeInTheDocument();
    expect(screen.getByText('Desktop image URL is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates year field correctly', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    const yearField = screen.getByLabelText(/year/i);
    
    await user.clear(yearField);
    await user.type(yearField, '1800');
    
    const addButton = screen.getByRole('button', { name: /add car/i });
    await user.click(addButton);

    expect(screen.getByText('Please enter a valid year')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    // First, trigger validation errors
    const addButton = screen.getByRole('button', { name: /add car/i });
    await user.click(addButton);

    expect(screen.getByText('Make is required')).toBeInTheDocument();

    // Then start typing in the make field
    const makeField = screen.getByLabelText(/make/i);
    await user.type(makeField, 'T');

    expect(screen.queryByText('Make is required')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    const formData = {
      make: 'Toyota',
      model: 'Camry',
      year: '2023',
      color: 'Blue',
      mobileImage: 'mobile.jpg',
      tabletImage: 'tablet.jpg',
      desktopImage: 'desktop.jpg'
    };

    await user.type(screen.getByLabelText(/make/i), formData.make);
    await user.type(screen.getByLabelText(/model/i), formData.model);
    await user.clear(screen.getByLabelText(/year/i));
    await user.type(screen.getByLabelText(/year/i), formData.year);
    await user.type(screen.getByLabelText(/color/i), formData.color);
    await user.type(screen.getByLabelText(/mobile image url/i), formData.mobileImage);
    await user.type(screen.getByLabelText(/tablet image url/i), formData.tabletImage);
    await user.type(screen.getByLabelText(/desktop image url/i), formData.desktopImage);

    const addButton = screen.getByRole('button', { name: /add car/i });
    await user.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Blue',
      mobileImage: 'mobile.jpg',
      tabletImage: 'tablet.jpg',
      desktopImage: 'desktop.jpg'
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form data when dialog is closed', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    // Fill in some data
    await user.type(screen.getByLabelText(/make/i), 'Toyota');
    await user.type(screen.getByLabelText(/model/i), 'Camry');

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Reopen dialog
    render(<AddCarForm {...defaultProps} />);

    // Check that fields are reset
    expect(screen.getByLabelText(/make/i)).toHaveValue('');
    expect(screen.getByLabelText(/model/i)).toHaveValue('');
  });

  it('handles year input correctly', async () => {
    const user = userEvent.setup();
    render(<AddCarForm {...defaultProps} />);

    const yearField = screen.getByLabelText(/year/i);
    
    await user.clear(yearField);
    await user.type(yearField, '2024');

    expect(yearField).toHaveValue(2024);
  });

  it('sets current year as default year', () => {
    render(<AddCarForm {...defaultProps} />);

    const yearField = screen.getByLabelText(/year/i);
    const currentYear = new Date().getFullYear();
    
    expect(yearField).toHaveValue(currentYear);
  });
});