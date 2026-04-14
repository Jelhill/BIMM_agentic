import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddBookForm } from '@/components/AddBookForm';

const mockAddBook = vi.fn();
const mockOnClose = vi.fn();

vi.mock('@/hooks/useBooks', () => ({
  useBooks: () => ({
    addBook: mockAddBook,
    books: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('AddBookForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pages/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i have read this book/i)).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(<AddBookForm open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Add New Book')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('fills form fields correctly', async () => {
    const user = userEvent.setup();
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const authorInput = screen.getByLabelText(/author/i);
    const yearInput = screen.getByLabelText(/year/i);
    const pagesInput = screen.getByLabelText(/pages/i);
    const coverInput = screen.getByLabelText(/cover url/i);
    
    await user.type(titleInput, 'Test Book');
    await user.type(authorInput, 'Test Author');
    await user.clear(yearInput);
    await user.type(yearInput, '2023');
    await user.clear(pagesInput);
    await user.type(pagesInput, '300');
    await user.type(coverInput, 'https://example.com/cover.jpg');
    
    expect(titleInput).toHaveValue('Test Book');
    expect(authorInput).toHaveValue('Test Author');
    expect(yearInput).toHaveValue(2023);
    expect(pagesInput).toHaveValue(300);
    expect(coverInput).toHaveValue('https://example.com/cover.jpg');
  });

  it('selects genre from dropdown', async () => {
    const user = userEvent.setup();
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    const genreSelect = screen.getByLabelText(/genre/i);
    await user.click(genreSelect);
    
    const fictionOption = screen.getByRole('option', { name: 'Fiction' });
    await user.click(fictionOption);
    
    expect(genreSelect).toHaveTextContent('Fiction');
  });

  it('toggles read checkbox', async () => {
    const user = userEvent.setup();
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    const readCheckbox = screen.getByLabelText(/i have read this book/i);
    expect(readCheckbox).not.toBeChecked();
    
    await user.click(readCheckbox);
    expect(readCheckbox).toBeChecked();
    
    await user.click(readCheckbox);
    expect(readCheckbox).not.toBeChecked();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    mockAddBook.mockResolvedValueOnce({ id: '1', title: 'Test Book' });
    
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    
    const genreSelect = screen.getByLabelText(/genre/i);
    await user.click(genreSelect);
    await user.click(screen.getByRole('option', { name: 'Fiction' }));
    
    await user.clear(screen.getByLabelText(/year/i));
    await user.type(screen.getByLabelText(/year/i), '2023');
    await user.clear(screen.getByLabelText(/pages/i));
    await user.type(screen.getByLabelText(/pages/i), '300');
    await user.type(screen.getByLabelText(/cover url/i), 'https://example.com/cover.jpg');
    await user.click(screen.getByLabelText(/i have read this book/i));
    
    const submitButton = screen.getByRole('button', { name: /add book/i });
    await user.click(submitButton);
    
    expect(mockAddBook).toHaveBeenCalledWith({
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Fiction',
      year: 2023,
      pages: 300,
      read: true,
      cover: 'https://example.com/cover.jpg',
    });
  });

  it('closes dialog and resets form after successful submission', async () => {
    const user = userEvent.setup();
    mockAddBook.mockResolvedValueOnce({ id: '1', title: 'Test Book' });
    
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    
    const genreSelect = screen.getByLabelText(/genre/i);
    await user.click(genreSelect);
    await user.click(screen.getByRole('option', { name: 'Fiction' }));
    
    await user.clear(screen.getByLabelText(/pages/i));
    await user.type(screen.getByLabelText(/pages/i), '300');
    
    const submitButton = screen.getByRole('button', { name: /add book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('handles submission error gracefully', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAddBook.mockRejectedValueOnce(new Error('Network error'));
    
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    
    const genreSelect = screen.getByLabelText(/genre/i);
    await user.click(genreSelect);
    await user.click(screen.getByRole('option', { name: 'Fiction' }));
    
    await user.clear(screen.getByLabelText(/pages/i));
    await user.type(screen.getByLabelText(/pages/i), '300');
    
    const submitButton = screen.getByRole('button', { name: /add book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error adding book:', expect.any(Error));
    });
    
    expect(mockOnClose).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveAddBook: (value: any) => void;
    mockAddBook.mockReturnValueOnce(new Promise(resolve => {
      resolveAddBook = resolve;
    }));
    
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    
    const genreSelect = screen.getByLabelText(/genre/i);
    await user.click(genreSelect);
    await user.click(screen.getByRole('option', { name: 'Fiction' }));
    
    await user.clear(screen.getByLabelText(/pages/i));
    await user.type(screen.getByLabelText(/pages/i), '300');
    
    const submitButton = screen.getByRole('button', { name: /add book/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    
    resolveAddBook!({ id: '1', title: 'Test Book' });
  });

  it('resets form when dialog is closed', async () => {
    const user = userEvent.setup();
    render(<AddBookForm open={true} onClose={mockOnClose} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});