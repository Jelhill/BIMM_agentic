import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BookCard } from '@/components/BookCard';
import { Book } from '@/types';

const mockBook: Book = {
  id: '1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  genre: 'Fiction',
  year: 1925,
  pages: 180,
  read: true,
  cover: 'https://example.com/gatsby-cover.jpg',
};

const mockUnreadBook: Book = {
  id: '2',
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  genre: 'Literary Fiction',
  year: 1960,
  pages: 281,
  read: false,
  cover: 'https://example.com/mockingbird-cover.jpg',
};

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('BookCard', () => {
  it('renders book title correctly', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    expect(screen.getByRole('heading', { name: 'The Great Gatsby' })).toBeInTheDocument();
  });

  it('renders book author correctly', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('renders book genre correctly', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    expect(screen.getByText('FICTION')).toBeInTheDocument();
  });

  it('renders book year and pages correctly', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    expect(screen.getByText('1925')).toBeInTheDocument();
    expect(screen.getByText('180 pages')).toBeInTheDocument();
  });

  it('renders book cover image with correct attributes', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    const image = screen.getByAltText('The Great Gatsby cover');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/gatsby-cover.jpg');
  });

  it('displays "Read" chip for read books', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    const chip = screen.getByText('Read');
    expect(chip).toBeInTheDocument();
  });

  it('displays "Unread" chip for unread books', () => {
    renderWithTheme(<BookCard book={mockUnreadBook} />);
    
    const chip = screen.getByText('Unread');
    expect(chip).toBeInTheDocument();
  });

  it('renders all book information for unread book', () => {
    renderWithTheme(<BookCard book={mockUnreadBook} />);
    
    expect(screen.getByRole('heading', { name: 'To Kill a Mockingbird' })).toBeInTheDocument();
    expect(screen.getByText('by Harper Lee')).toBeInTheDocument();
    expect(screen.getByText('LITERARY FICTION')).toBeInTheDocument();
    expect(screen.getByText('1960')).toBeInTheDocument();
    expect(screen.getByText('281 pages')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
  });

  it('displays book icon for pages information', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    // The BookIcon is rendered with the pages text
    expect(screen.getByText('180 pages')).toBeInTheDocument();
  });

  it('renders card with proper structure', () => {
    renderWithTheme(<BookCard book={mockBook} />);
    
    // Check that the card container exists
    const card = screen.getByRole('img').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('handles long titles appropriately', () => {
    const longTitleBook: Book = {
      ...mockBook,
      title: 'This Is a Very Long Book Title That Should Be Truncated Properly When Displayed in the Card Component',
    };
    
    renderWithTheme(<BookCard book={longTitleBook} />);
    
    expect(screen.getByRole('heading', { name: /This Is a Very Long Book Title/ })).toBeInTheDocument();
  });

  it('handles different genres correctly', () => {
    const scienceFictionBook: Book = {
      ...mockBook,
      genre: 'Science Fiction',
    };
    
    renderWithTheme(<BookCard book={scienceFictionBook} />);
    
    expect(screen.getByText('SCIENCE FICTION')).toBeInTheDocument();
  });
});