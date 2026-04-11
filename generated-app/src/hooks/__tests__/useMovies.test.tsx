import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { useMovies, MovieInput } from '../useMovies';
import { GET_MOVIES, ADD_MOVIE } from '@/graphql/queries';

const mockMovies = [
  {
    id: '1',
    title: 'The Matrix',
    genre: 'Sci-Fi',
    year: 1999,
    rating: 8.7,
    watched: true,
    poster: 'matrix.jpg'
  },
  {
    id: '2',
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    rating: 8.8,
    watched: false,
    poster: 'inception.jpg'
  }
];

const mockNewMovie = {
  id: '3',
  title: 'Interstellar',
  genre: 'Sci-Fi',
  year: 2014,
  rating: 8.6,
  watched: false,
  poster: 'interstellar.jpg'
};

const successMocks = [
  {
    request: {
      query: GET_MOVIES,
    },
    result: {
      data: {
        movies: mockMovies,
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_MOVIES,
    },
    error: new Error('Failed to fetch movies'),
  },
];

const addMovieMocks = [
  {
    request: {
      query: GET_MOVIES,
    },
    result: {
      data: {
        movies: mockMovies,
      },
    },
  },
  {
    request: {
      query: ADD_MOVIE,
      variables: {
        input: {
          title: 'Interstellar',
          genre: 'Sci-Fi',
          year: 2014,
          rating: 8.6,
          watched: false,
          poster: 'interstellar.jpg'
        }
      },
    },
    result: {
      data: {
        addMovie: mockNewMovie,
      },
    },
  },
];

const addMovieErrorMocks = [
  {
    request: {
      query: GET_MOVIES,
    },
    result: {
      data: {
        movies: mockMovies,
      },
    },
  },
  {
    request: {
      query: ADD_MOVIE,
      variables: {
        input: {
          title: 'Interstellar',
          genre: 'Sci-Fi',
          year: 2014,
          rating: 8.6,
          watched: false,
          poster: 'interstellar.jpg'
        }
      },
    },
    error: new Error('Failed to add movie'),
  },
];

const createWrapper = (mocks: any[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useMovies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    const wrapper = createWrapper(successMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.movies).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch movies successfully', async () => {
    const wrapper = createWrapper(successMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toEqual(mockMovies);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle fetch error', async () => {
    const wrapper = createWrapper(errorMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toEqual([]);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to fetch movies');
  });

  it('should add a movie successfully', async () => {
    const wrapper = createWrapper(addMovieMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toEqual(mockMovies);

    const movieInput: MovieInput = {
      title: 'Interstellar',
      genre: 'Sci-Fi',
      year: 2014,
      rating: 8.6,
      watched: false,
      poster: 'interstellar.jpg'
    };

    await result.current.addMovie(movieInput);

    await waitFor(() => {
      expect(result.current.movies).toHaveLength(3);
    });

    expect(result.current.movies).toEqual([...mockMovies, mockNewMovie]);
  });

  it('should handle add movie error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = createWrapper(addMovieErrorMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const movieInput: MovieInput = {
      title: 'Interstellar',
      genre: 'Sci-Fi',
      year: 2014,
      rating: 8.6,
      watched: false,
      poster: 'interstellar.jpg'
    };

    await expect(result.current.addMovie(movieInput)).rejects.toThrow('Failed to add movie');
    expect(consoleSpy).toHaveBeenCalledWith('Error adding movie:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should provide refetch function', async () => {
    const wrapper = createWrapper(successMocks);
    const { result } = renderHook(() => useMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});