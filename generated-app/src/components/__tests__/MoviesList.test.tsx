import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MockedProvider } from '@apollo/client/testing';
import { GET_MOVIES, ADD_MOVIE } from '@/graphql/queries';
import { MoviesList } from '../MoviesList';

const theme = createTheme();

const mockMovies = [
  {
    id: '1',
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    year: 2008,
    genre: 'Action',
    rating: 9.0,
    description: 'When the menace known as The Joker emerges, Batman must face one of the greatest psychological and physical tests.',
    poster: 'https://example.com/dark-knight.jpg'
  },
  {
    id: '2',
    title: 'Inception',
    director: 'Christopher Nolan',
    year: 2010,
    genre: 'Sci-Fi',
    rating: 8.8,
    description: 'A thief who steals corporate secrets through dream-sharing technology.',
    poster: 'https://example.com/inception.jpg'
  },
  {
    id: '3',
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    year: 1994,
    genre: 'Crime',
    rating: 8.9,
    description: 'The lives of two mob hitmen, a boxer, and other criminals intertwine.',
    poster: 'https://example.com/pulp-fiction.jpg'
  }
];

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

const loadingMocks = [
  {
    request: {
      query: GET_MOVIES,
    },
    delay: 1000,
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
  ...successMocks,
  {
    request: {
      query: ADD_MOVIE,
      variables: {
        input: {
          title: 'New Movie',
          director: 'New Director',
          year: 2023,
          genre: 'Action',
          rating: 8.5,
          description: 'A new movie description',
          poster: 'https://example.com/new-movie.jpg'
        }
      }
    },
    result: {
      data: {
        addMovie: {
          id: '4',
          title: 'New Movie',
          director: 'New Director',
          year: 2023,
          genre: 'Action',
          rating: 8.5,
          description: 'A new movie description',
          poster: 'https://example.com/new-movie.jpg'
        }
      }
    }
  }
];

const renderMoviesList = (mocks = successMocks) => {
  return render(
    <ThemeProvider theme={theme}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoviesList />
      </MockedProvider>
    </ThemeProvider>
  );
};

// Mock ResizeObserver for responsive tests
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query.includes('(max-width: 899.95px)') ? false : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('MoviesList Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching movies', () => {
      renderMoviesList(loadingMocks);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Movie Collection')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      renderMoviesList(errorMocks);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading movies:/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch movies/)).toBeInTheDocument();
      });
    });

    it('should allow retry on error', async () => {
      const user = userEvent.setup();
      renderMoviesList(errorMocks);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading movies:/)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      // Should attempt to fetch again (loading state)
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should display movies grid when data loads successfully', async () => {
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('Movie Collection')).toBeInTheDocument();
      });

      // Check that all movies are displayed
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('Pulp Fiction')).toBeInTheDocument();

      // Check director names
      expect(screen.getAllByText('Christopher Nolan')).toHaveLength(2);
      expect(screen.getByText('Quentin Tarantino')).toBeInTheDocument();
    });

    it('should display add movie button on desktop', async () => {
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add movie/i })).toBeInTheDocument();
      });
    });

    it('should display floating action button on mobile', async () => {
      // Mock mobile breakpoint
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('(max-width: 899.95px)') ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/add movie/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no movies exist', async () => {
      const emptyMocks = [
        {
          request: {
            query: GET_MOVIES,
          },
          result: {
            data: {
              movies: [],
            },
          },
        },
      ];

      renderMoviesList(emptyMocks);
      
      await waitFor(() => {
        expect(screen.getByText('No movies in your collection yet.')).toBeInTheDocument();
        expect(screen.getByText('Start by adding your first movie!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add your first movie/i })).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration', () => {
    it('should display no results message when search yields no matches', async () => {
      const user = userEvent.setup();
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // Search for non-existent movie
      const searchInput = screen.getByLabelText(/search movies/i);
      await user.type(searchInput, 'Non-existent Movie');

      await waitFor(() => {
        expect(screen.getByText('No movies match your search criteria.')).toBeInTheDocument();
        expect(screen.queryByText('The Dark Knight')).not.toBeInTheDocument();
      });
    });

    it('should filter movies based on search input', async () => {
      const user = userEvent.setup();
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // Search for specific movie
      const searchInput = screen.getByLabelText(/search movies/i);
      await user.type(searchInput, 'Dark Knight');

      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();
        expect(screen.queryByText('Pulp Fiction')).not.toBeInTheDocument();
      });
    });

    it('should sort movies by different criteria', async () => {
      const user = userEvent.setup();
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // Open sort dropdown
      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.click(sortSelect);

      // Select year sort
      const yearOption = screen.getByText('Year (Newest First)');
      await user.click(yearOption);

      // Should sort by year - Inception (2010) should come before The Dark Knight (2008)
      const movieTitles = screen.getAllByRole('heading', { level: 6 });
      const titleTexts = movieTitles.map(title => title.textContent);
      
      const inceptionIndex = titleTexts.findIndex(title => title?.includes('Inception'));
      const darkKnightIndex = titleTexts.findIndex(title => title?.includes('The Dark Knight'));
      
      expect(inceptionIndex).toBeLessThan(darkKnightIndex);
    });
  });

  describe('Add Movie Integration', () => {
    it('should open add movie form when button is clicked', async () => {
      const user = userEvent.setup();
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('Movie Collection')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add movie/i });
      await user.click(addButton);

      // Should open the add movie dialog
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Movie')).toBeInTheDocument();
    });

    it('should close add movie form when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('Movie Collection')).toBeInTheDocument();
      });

      // Open form
      const addButton = screen.getByRole('button', { name: /add movie/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close form
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should render movies in responsive grid layout', async () => {
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // Check that movies are rendered in grid items
      const movieCards = screen.getAllByRole('article');
      expect(movieCards).toHaveLength(3);

      // Each movie card should be within a grid item
      movieCards.forEach(card => {
        expect(card.closest('[class*="MuiGrid2-root"]')).toBeInTheDocument();
      });
    });

    it('should display movie details correctly in cards', async () => {
      renderMoviesList();
      
      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // Check The Dark Knight details
      expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
      expect(screen.getByText('2008')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('9.0')).toBeInTheDocument();

      // Check Inception details
      expect(screen.getByText('2010')).toBeInTheDocument();
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
      expect(screen.getByText('8.8')).toBeInTheDocument();

      // Check Pulp Fiction details
      expect(screen.getByText('Quentin Tarantino')).toBeInTheDocument();
      expect(screen.getByText('1994')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
      expect(screen.getByText('8.9')).toBeInTheDocument();
    });
  });

  describe('Complete Data Flow', () => {
    it('should handle complete user workflow: load movies, search, sort, and add new movie', async () => {
      const user = userEvent.setup();
      renderMoviesList(addMovieMocks);
      
      // 1. Movies load successfully
      await waitFor(() => {
        expect(screen.getByText('Movie Collection')).toBeInTheDocument();
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });

      // 2. Search for specific movies
      const searchInput = screen.getByLabelText(/search movies/i);
      await user.type(searchInput, 'Nolan');

      await waitFor(() => {
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.queryByText('Pulp Fiction')).not.toBeInTheDocument();
      });

      // 3. Clear search
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Pulp Fiction')).toBeInTheDocument();
      });

      // 4. Sort by rating
      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.click(sortSelect);
      
      const ratingOption = screen.getByText('Rating (High to Low)');
      await user.click(ratingOption);

      // 5. Open add movie form
      const addButton = screen.getByRole('button', { name: /add movie/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});