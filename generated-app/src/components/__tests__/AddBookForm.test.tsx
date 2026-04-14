import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddBookForm } from '@/components/AddBookForm';

describe('AddBookForm', () => {
  const mockOnClose = vi.fn();
  const mockAddBook = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    addBook: mockAddBook,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form when open is true', () => {
    render(<AddBookForm {...defaultProps} />);
    
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Author')).toBeInTheDocument();
    expect(screen.getByLabelText('Genre')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Pages')).toBeInTheDocument();
    expect(screen.getByLabelText('Cover URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Already read')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Book' })).toBeInTheDocument();
  });

  it('does not render the form when open is false', () => {
    render(<AddBookForm {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Add New Book')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates form fields when user types', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    const authorInput = screen.getByLabelText('Author');
    
    await user.type(titleInput, 'Test Book');
    await user.type(authorInput, 'Test Author');
    
    expect(titleInput).toHaveValue('Test Book');
    expect(authorInput).toHaveValue('Test Author');
  });

  it('handles checkbox toggle correctly', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const readCheckbox = screen.getByLabelText('Already read');
    
    expect(readCheckbox).not.toBeChecked();
    
    await user.click(readCheckbox);
    
    expect(readCheckbox).toBeChecked();
  });

  it('submits form with correct data when all required fields are filled', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    await user.type(screen.getByLabelText('Title'), 'The Great Gatsby');
    await user.type(screen.getByLabelText('Author'), 'F. Scott Fitzgerald');
    await user.type(screen.getByLabelText('Genre'), 'Fiction');
    await user.type(screen.getByLabelText('Year'), '1925');
    await user.type(screen.getByLabelText('Pages'), '180');
    await user.type(screen.getByLabelText('Cover URL'), 'https://example.com/cover.jpg');
    await user.click(screen.getByLabelText('Already read'));
    
    const submitButton = screen.getByRole('button', { name: 'Add Book' });
    await user.click(submitButton);
    
    expect(mockAddBook).toHaveBeenCalledTimes(1);
    expect(mockAddBook).toHaveBeenCalledWith({
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      year: 1925,
      pages: 180,
      read: true,
      cover: 'https://example.com/cover.jpg',
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits form with read as false when checkbox is not checked', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    await user.type(screen.getByLabelText('Title'), 'Test Book');
    await user.type(screen.getByLabelText('Author'), 'Test Author');
    await user.type(screen.getByLabelText('Genre'), 'Test Genre');
    await user.type(screen.getByLabelText('Year'), '2023');
    await user.type(screen.getByLabelText('Pages'), '300');
    
    const submitButton = screen.getByRole('button', { name: 'Add Book' });
    await user.click(submitButton);
    
    expect(mockAddBook).toHaveBeenCalledWith(
      expect.objectContaining({
        read: false,
      })
    );
  });

  it('resets form fields after successful submission', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    const readCheckbox = screen.getByLabelText('Already read');
    
    await user.type(titleInput, 'Test Book');
    await user.type(screen.getByLabelText('Author'), 'Test Author');
    await user.type(screen.getByLabelText('Genre'), 'Test Genre');
    await user.type(screen.getByLabelText('Year'), '2023');
    await user.type(screen.getByLabelText('Pages'), '300');
    await user.click(readCheckbox);
    
    const submitButton = screen.getByRole('button', { name: 'Add Book' });
    await user.click(submitButton);
    
    // Re-render with open=true to see the reset form
    render(<AddBookForm {...defaultProps} />);
    
    const newTitleInput = screen.getByLabelText('Title');
    const newReadCheckbox = screen.getByLabelText('Already read');
    
    expect(newTitleInput).toHaveValue('');
    expect(newReadCheckbox).not.toBeChecked();
  });

  it('resets form fields when dialog is closed without submission', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Book');
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    
    // Re-render to check if form is reset
    render(<AddBookForm {...defaultProps} />);
    const newTitleInput = screen.getByLabelText('Title');
    expect(newTitleInput).toHaveValue('');
  });

  it('prevents form submission when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Add Book' });
    await user.click(submitButton);
    
    // Form should not submit and addBook should not be called
    expect(mockAddBook).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking outside the dialog', () => {
    render(<AddBookForm {...defaultProps} />);
    
    // Simulate clicking on the backdrop
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('handles numeric inputs correctly', async () => {
    const user = userEvent.setup();
    render(<AddBookForm {...defaultProps} />);
    
    const yearInput = screen.getByLabelText('Year');
    const pagesInput = screen.getByLabelText('Pages');
    
    await user.type(yearInput, '2023');
    await user.type(pagesInput, '250');
    
    expect(yearInput).toHaveValue(2023);
    expect(pagesInput).toHaveValue(250);
  });
});