import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BooksList } from '@/components/BooksList';
import { Book } from '@/types';

const theme = createTheme();

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    year: 1925,
    pages: 180,
    read: true,
    cover: 'https://example.com/gatsby.jpg',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian Fiction',
    year: 1949,
    pages: 328,
    read: false,
    cover: 'https://example.com/1984.jpg',
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    pages: 376,
    read: true,
    cover: 'https://example.com/mockingbird.jpg',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('BooksList', () => {
  it('renders book cards for each book', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();

    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('by George Orwell')).toBeInTheDocument();
    expect(screen.getByText('by Harper Lee')).toBeInTheDocument();
  });

  it('displays "No books found" message when books array is empty', () => {
    renderWithTheme(<BooksList books={[]} />);

    expect(screen.getByText('No books found')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders responsive grid container with correct spacing', () => {
    const { container } = renderWithTheme(<BooksList books={mockBooks} />);

    const gridContainer = container.querySelector('.MuiGrid2-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders correct number of book cards', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    const bookCards = screen.getAllByRole('img');
    expect(bookCards).toHaveLength(mockBooks.length);
  });

  it('displays book covers with correct alt text', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    expect(screen.getByAltText('The Great Gatsby cover')).toBeInTheDocument();
    expect(screen.getByAltText('1984 cover')).toBeInTheDocument();
    expect(screen.getByAltText('To Kill a Mockingbird cover')).toBeInTheDocument();
  });

  it('displays book genres', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    expect(screen.getAllByText('Fiction')).toHaveLength(2);
    expect(screen.getByText('Dystopian Fiction')).toBeInTheDocument();
  });

  it('displays book years and page counts', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    expect(screen.getByText('1925')).toBeInTheDocument();
    expect(screen.getByText('1949')).toBeInTheDocument();
    expect(screen.getByText('1960')).toBeInTheDocument();

    expect(screen.getByText('180 pages')).toBeInTheDocument();
    expect(screen.getByText('328 pages')).toBeInTheDocument();
    expect(screen.getByText('376 pages')).toBeInTheDocument();
  });

  it('displays read status chips', () => {
    renderWithTheme(<BooksList books={mockBooks} />);

    const readChips = screen.getAllByText('Read');
    const unreadChips = screen.getAllByText('Unread');

    expect(readChips).toHaveLength(2);
    expect(unreadChips).toHaveLength(1);
  });

  it('handles single book correctly', () => {
    const singleBook = [mockBooks[0]];
    renderWithTheme(<BooksList books={singleBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.queryByText('1984')).not.toBeInTheDocument();
  });
});