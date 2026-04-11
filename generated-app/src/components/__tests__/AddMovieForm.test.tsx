import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddMovieForm } from '../AddMovieForm';
import { ADD_MOVIE, GET_MOVIES } from '@/graphql/queries';

const mockOnClose = vi.fn();

const mockMovie = {
  id: '1',
  title: 'Test Movie',
  genre: 'Action',
  year: 2023,
  rating: 8.5,
  watched: false,
  poster: 'https://example.com/poster.jpg',
};

const addMovieMock: MockedResponse = {
  request: {
    query: ADD_MOVIE,
    variables: {
      input: {
        title: 'Test Movie',
        genre: 'Action',
        year: 2023,
        rating: 8.5,
        watched: false,
        poster: 'https://example.com/poster.jpg',
      },
    },
  },
  result: {
    data: {
      addMovie: mockMovie,
    },
  },
};

const getMoviesMock: MockedResponse = {
  request: {
    query: GET_MOVIES,
  },
  result: {
    data: {
      movies: [],
    },
  },
};

const renderWithMocks = (mocks: MockedResponse[] = [getMoviesMock]) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddMovieForm open={true} onClose={mockOnClose} />
    </MockedProvider>
  );
};

describe('AddMovieForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly when open', () => {
    renderWithMocks();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Movie')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Genre')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Poster URL')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Watched' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Movie' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MockedProvider mocks={[getMoviesMock]} addTypename={false}>
        <AddMovieForm open={false} onClose={mockOnClose} />
      </MockedProvider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithMocks();

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Genre is required')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('validates year range', async () => {
    renderWithMocks();

    const yearField = screen.getByLabelText('Year');
    fireEvent.change(yearField, { target: { value: '1800' } });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Year must be between 1888 and/)).toBeInTheDocument();
    });
  });

  it('validates rating range', async () => {
    renderWithMocks();

    const ratingField = screen.getByLabelText('Rating');
    fireEvent.change(ratingField, { target: { value: '15' } });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Rating must be between 0 and 10')).toBeInTheDocument();
    });
  });

  it('validates poster URL format', async () => {
    renderWithMocks();

    const posterField = screen.getByLabelText('Poster URL');
    fireEvent.change(posterField, { target: { value: 'invalid-url' } });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    renderWithMocks();

    // Trigger validation error
    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Start typing in title field
    const titleField = screen.getByLabelText('Title');
    fireEvent.change(titleField, { target: { value: 'Test' } });

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    renderWithMocks([getMoviesMock, addMovieMock]);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Movie' } });
    
    // Open genre dropdown and select Action
    const genreSelect = screen.getByLabelText('Genre');
    fireEvent.mouseDown(genreSelect);
    const actionOption = screen.getByText('Action');
    fireEvent.click(actionOption);

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2023' } });
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '8.5' } });
    fireEvent.change(screen.getByLabelText('Poster URL'), { 
      target: { value: 'https://example.com/poster.jpg' } 
    });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: ADD_MOVIE,
        variables: {
          input: {
            title: 'Test Movie',
            genre: 'Action',
            year: 2023,
            rating: 8.5,
            watched: false,
            poster: 'https://example.com/poster.jpg',
          },
        },
      },
      error: new Error('Failed to add movie'),
    };

    renderWithMocks([getMoviesMock, errorMock]);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Movie' } });
    
    const genreSelect = screen.getByLabelText('Genre');
    fireEvent.mouseDown(genreSelect);
    const actionOption = screen.getByText('Action');
    fireEvent.click(actionOption);

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2023' } });
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '8.5' } });
    fireEvent.change(screen.getByLabelText('Poster URL'), { 
      target: { value: 'https://example.com/poster.jpg' } 
    });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to add movie')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes dialog when cancel button is clicked', () => {
    renderWithMocks();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when closed', async () => {
    renderWithMocks();

    // Fill out form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Movie' } });
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '8.5' } });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();

    // Re-render as open to check if form is reset
    render(
      <MockedProvider mocks={[getMoviesMock]} addTypename={false}>
        <AddMovieForm open={true} onClose={mockOnClose} />
      </MockedProvider>
    );

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Rating')).toHaveValue(0);
  });

  it('toggles watched checkbox', () => {
    renderWithMocks();

    const watchedCheckbox = screen.getByRole('checkbox', { name: 'Watched' });
    expect(watchedCheckbox).not.toBeChecked();

    fireEvent.click(watchedCheckbox);
    expect(watchedCheckbox).toBeChecked();

    fireEvent.click(watchedCheckbox);
    expect(watchedCheckbox).not.toBeChecked();
  });

  it('shows loading state during submission', async () => {
    const slowMock: MockedResponse = {
      ...addMovieMock,
      delay: 100,
    };

    renderWithMocks([getMoviesMock, slowMock]);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Movie' } });
    
    const genreSelect = screen.getByLabelText('Genre');
    fireEvent.mouseDown(genreSelect);
    const actionOption = screen.getByText('Action');
    fireEvent.click(actionOption);

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2023' } });
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '8.5' } });
    fireEvent.change(screen.getByLabelText('Poster URL'), { 
      target: { value: 'https://example.com/poster.jpg' } 
    });

    const addButton = screen.getByRole('button', { name: 'Add Movie' });
    fireEvent.click(addButton);

    // Check that button is disabled during loading
    expect(addButton).toBeDisabled();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});