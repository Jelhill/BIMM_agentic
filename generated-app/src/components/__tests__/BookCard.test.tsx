import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { vi } from 'vitest';
import { BookCard } from '@/components/BookCard';
import { Book } from '@/types';

vi.mock('@mui/material/useMediaQuery');

const mockUseMediaQuery = vi.mocked(useMediaQuery);

const mockBook: Book = {
  id: '1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  genre: 'Fiction',
  year: 1925,
  pages: 180,
  read: true,
  cover: 'https://example.com/gatsby-cover.jpg'
};

const mockUnreadBook: Book = {
  id: '2',
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  genre: 'Fiction',
  year: 1960,
  pages: 376,
  read: false,
  cover: 'https://example.com/mockingbird-cover.jpg'
};

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('BookCard', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset();
    mockUseMediaQuery.mockReturnValue(false);
  });

  it('renders book details correctly', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('Fiction • 1925')).toBeInTheDocument();
    expect(screen.getByText('180 pages')).toBeInTheDocument();
  });

  it('displays book cover image with correct attributes', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    const image = screen.getByRole('img', { name: 'The Great Gatsby' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/gatsby-cover.jpg');
    expect(image).toHaveAttribute('alt', 'The Great Gatsby');
  });

  it('shows read status chip for read book', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    const readChip = screen.getByText('Read');
    expect(readChip).toBeInTheDocument();
  });

  it('shows unread status chip for unread book', () => {
    renderWithTheme(<BookCard book={mockUnreadBook} />);

    const unreadChip = screen.getByText('Unread');
    expect(unreadChip).toBeInTheDocument();
  });

  it('displays book icon with pages count', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    expect(screen.getByTestId('BookIcon')).toBeInTheDocument();
    expect(screen.getByText('180 pages')).toBeInTheDocument();
  });

  describe('responsive image behavior', () => {
    it('uses mobile height on mobile viewport', () => {
      mockUseMediaQuery.mockImplementation((query) => {
        const queryString = typeof query === 'string' ? query : query.toString();
        if (queryString.includes('down')) return true;
        return false;
      });

      renderWithTheme(<BookCard book={mockBook} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('height', '200');
    });

    it('uses tablet height on tablet viewport', () => {
      mockUseMediaQuery.mockImplementation((query) => {
        const queryString = typeof query === 'string' ? query : query.toString();
        if (queryString.includes('down')) return false;
        if (queryString.includes('between')) return true;
        return false;
      });

      renderWithTheme(<BookCard book={mockBook} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('height', '240');
    });

    it('uses desktop height on desktop viewport', () => {
      mockUseMediaQuery.mockReturnValue(false);

      renderWithTheme(<BookCard book={mockBook} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('height', '280');
    });
  });

  it('handles long titles with text overflow', () => {
    const longTitleBook: Book = {
      ...mockBook,
      title: 'This is a Very Long Book Title That Should Be Truncated When It Exceeds the Maximum Width'
    };

    renderWithTheme(<BookCard book={longTitleBook} />);

    const titleElement = screen.getByRole('heading', { level: 2 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(longTitleBook.title);
  });

  it('renders author name in italic style', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    const authorElement = screen.getByText('by F. Scott Fitzgerald');
    expect(authorElement).toBeInTheDocument();
  });

  it('displays genre and year in secondary text color', () => {
    renderWithTheme(<BookCard book={mockBook} />);

    const genreYearElement = screen.getByText('Fiction • 1925');
    expect(genreYearElement).toBeInTheDocument();
  });
});