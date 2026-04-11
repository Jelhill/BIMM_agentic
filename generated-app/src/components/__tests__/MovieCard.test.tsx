import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovieCard } from '@/components/MovieCard';
import { Movie } from '@/types';

const mockMovie: Movie = {
  id: '1',
  title: 'The Dark Knight',
  genre: 'Action',
  year: 2008,
  rating: 4.5,
  watched: true,
  poster: 'https://example.com/dark-knight.jpg'
};

const mockUnwatchedMovie: Movie = {
  id: '2',
  title: 'Inception',
  genre: 'Sci-Fi',
  year: 2010,
  rating: 4.0,
  watched: false,
  poster: 'https://example.com/inception.jpg'
};

describe('MovieCard', () => {
  it('renders movie title correctly', () => {
    render(<MovieCard movie={mockMovie} />);
    
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
  });

  it('renders movie genre and year', () => {
    render(<MovieCard movie={mockMovie} />);
    
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('• 2008')).toBeInTheDocument();
  });

  it('renders movie poster with correct attributes', () => {
    render(<MovieCard movie={mockMovie} />);
    
    const poster = screen.getByRole('img', { name: 'The Dark Knight' });
    expect(poster).toHaveAttribute('src', 'https://example.com/dark-knight.jpg');
    expect(poster).toHaveAttribute('alt', 'The Dark Knight');
  });

  it('displays rating with stars and text', () => {
    render(<MovieCard movie={mockMovie} />);
    
    expect(screen.getByText('4.5/5')).toBeInTheDocument();
    
    const ratingElement = screen.getByRole('img', { name: /4.5 stars/i });
    expect(ratingElement).toBeInTheDocument();
  });

  it('shows "Watched" chip for watched movies', () => {
    render(<MovieCard movie={mockMovie} />);
    
    const watchedChip = screen.getByText('Watched');
    expect(watchedChip).toBeInTheDocument();
    expect(watchedChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
  });

  it('shows "Not Watched" chip for unwatched movies', () => {
    render(<MovieCard movie={mockUnwatchedMovie} />);
    
    const unwatchedChip = screen.getByText('Not Watched');
    expect(unwatchedChip).toBeInTheDocument();
    expect(unwatchedChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
  });

  it('renders all movie information for unwatched movie', () => {
    render(<MovieCard movie={mockUnwatchedMovie} />);
    
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('• 2010')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getByText('Not Watched')).toBeInTheDocument();
  });

  it('renders card with proper structure', () => {
    render(<MovieCard movie={mockMovie} />);
    
    const card = screen.getByRole('img').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();
    
    const cardContent = card?.querySelector('.MuiCardContent-root');
    expect(cardContent).toBeInTheDocument();
  });
});