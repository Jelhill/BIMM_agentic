import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchAndSort, SortOption, WatchedFilter } from '@/components/SearchAndSort';
import { Movie } from '@/types';

const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    rating: 8.8,
    watched: false
  },
  {
    id: '2',
    title: 'The Dark Knight',
    genre: 'Action',
    year: 2008,
    rating: 9.0,
    watched: true
  },
  {
    id: '3',
    title: 'Interstellar',
    genre: 'Sci-Fi',
    year: 2014,
    rating: 8.6,
    watched: false
  },
  {
    id: '4',
    title: 'The Matrix',
    genre: 'Sci-Fi',
    year: 1999,
    rating: 8.7,
    watched: true
  }
];

describe('SearchAndSort', () => {
  const mockOnFilteredMoviesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all input controls', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    expect(screen.getByLabelText(/search movies/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /watched/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unwatched/i })).toBeInTheDocument();
  });

  it('calls onFilteredMoviesChange with all movies on initial render', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    expect(mockOnFilteredMoviesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ year: 2014 }), // Interstellar
        expect.objectContaining({ year: 2010 }), // Inception
        expect.objectContaining({ year: 2008 }), // The Dark Knight
        expect.objectContaining({ year: 1999 })  // The Matrix
      ])
    );
  });

  it('filters movies by search term in title', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const searchInput = screen.getByLabelText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'Dark' } });

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'The Dark Knight' })
    ]);
  });

  it('filters movies by search term in genre', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const searchInput = screen.getByLabelText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'sci' } });

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Interstellar' }),
        expect.objectContaining({ title: 'Inception' }),
        expect.objectContaining({ title: 'The Matrix' })
      ])
    );
  });

  it('performs case-insensitive search', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const searchInput = screen.getByLabelText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'INCEPTION' } });

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'Inception' })
    ]);
  });

  it('sorts movies by year ascending', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Year (Oldest)'));

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ year: 1999 }), // The Matrix
      expect.objectContaining({ year: 2008 }), // The Dark Knight
      expect.objectContaining({ year: 2010 }), // Inception
      expect.objectContaining({ year: 2014 })  // Interstellar
    ]);
  });

  it('sorts movies by year descending (default)', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    expect(mockOnFilteredMoviesChange).toHaveBeenCalledWith([
      expect.objectContaining({ year: 2014 }), // Interstellar
      expect.objectContaining({ year: 2010 }), // Inception
      expect.objectContaining({ year: 2008 }), // The Dark Knight
      expect.objectContaining({ year: 1999 })  // The Matrix
    ]);
  });

  it('sorts movies by rating descending', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Rating (High to Low)'));

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ rating: 9.0 }), // The Dark Knight
      expect.objectContaining({ rating: 8.8 }), // Inception
      expect.objectContaining({ rating: 8.7 }), // The Matrix
      expect.objectContaining({ rating: 8.6 })  // Interstellar
    ]);
  });

  it('filters watched movies only', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const watchedButton = screen.getByRole('button', { name: /watched/i });
    fireEvent.click(watchedButton);

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'The Dark Knight', watched: true }),
        expect.objectContaining({ title: 'The Matrix', watched: true })
      ])
    );
  });

  it('filters unwatched movies only', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const unwatchedButton = screen.getByRole('button', { name: /unwatched/i });
    fireEvent.click(unwatchedButton);

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Interstellar', watched: false }),
        expect.objectContaining({ title: 'Inception', watched: false })
      ])
    );
  });

  it('combines search and filter functionality', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    // Search for Sci-Fi movies
    const searchInput = screen.getByLabelText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'sci-fi' } });

    // Filter for unwatched
    const unwatchedButton = screen.getByRole('button', { name: /unwatched/i });
    fireEvent.click(unwatchedButton);

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'Interstellar', watched: false }),
      expect.objectContaining({ title: 'Inception', watched: false })
    ]);
  });

  it('returns to all movies when clearing search', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const searchInput = screen.getByLabelText(/search movies/i);
    
    // First search
    fireEvent.change(searchInput, { target: { value: 'Inception' } });
    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'Inception' })
    ]);

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(mockMovies.map(movie => expect.objectContaining(movie)))
    );
  });

  it('handles empty search term with whitespace', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    const searchInput = screen.getByLabelText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: '   ' } });

    // Should return all movies since whitespace is trimmed
    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(mockMovies.map(movie => expect.objectContaining(movie)))
    );
  });

  it('maintains filter state when toggling back to all', () => {
    render(
      <SearchAndSort
        movies={mockMovies}
        onFilteredMoviesChange={mockOnFilteredMoviesChange}
      />
    );

    // Filter to watched
    const watchedButton = screen.getByRole('button', { name: /watched/i });
    fireEvent.click(watchedButton);

    // Back to all
    const allButton = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allButton);

    expect(mockOnFilteredMoviesChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(mockMovies.map(movie => expect.objectContaining(movie)))
    );
  });
});