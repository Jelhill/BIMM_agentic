import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import App from '@/App';
import { GET_BOOKS, ADD_BOOK } from '@/graphql/queries';

const mockBooks = [
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
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    pages: 281,
    read: false,
    cover: 'https://example.com/mockingbird.jpg',
  },
  {
    id: '3',
    title: 'Programming TypeScript',
    author: 'Boris Cherny',
    genre: 'Technology',
    year: 2019,
    pages: 324,
    read: true,
    cover: 'https://example.com/typescript.jpg',
  },
];

const getBooksSuccessMock = {
  request: {
    query: GET_BOOKS,
  },
  result: {
    data: {
      books: mockBooks,
    },
  },
};

const getBooksErrorMock = {
  request: {
    query: GET_BOOKS,
  },
  error: new GraphQLError('Failed to fetch books'),
};

const addBookSuccessMock = {
  request: {
    query: ADD_BOOK,
    variables: {
      input: {
        title: 'New Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
        year: 2023,
        pages: 200,
        read: false,
        cover: 'https://example.com/test.jpg',
      },
    },
  },
  result: {
    data: {
      addBook: {
        id: '4',
        title: 'New Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
        year: 2023,
        pages: 200,
        read: false,
        cover: 'https://example.com/test.jpg',
      },
    },
  },
};

const addBookErrorMock = {
  request: {
    query: ADD_BOOK,
    variables: {
      input: {
        title: 'Error Book',
        author: 'Error Author',
        genre: 'Error Genre',
        year: 2023,
        pages: 200,
        read: false,
        cover: 'https://example.com/error.jpg',
      },
    },
  },
  error: new GraphQLError('Failed to add book'),
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading spinner when fetching books', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when books query fails', async () => {
      render(
        <MockedProvider mocks={[getBooksErrorMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Error loading books: Failed to fetch books/)).toBeInTheDocument();
      });
    });
  });

  describe('Books Display', () => {
    it('displays list of books after loading', async () => {
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.getByText('Programming TypeScript')).toBeInTheDocument();

      expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
      expect(screen.getByText('Harper Lee')).toBeInTheDocument();
      expect(screen.getByText('Boris Cherny')).toBeInTheDocument();
    });

    it('displays "My Library" title and Add Book button', async () => {
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('My Library')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Functionality', () => {
    it('filters books by search term (title)', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by title or author...');
      await user.type(searchInput, 'gatsby');

      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
      expect(screen.queryByText('Programming TypeScript')).not.toBeInTheDocument();
    });

    it('filters books by search term (author)', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Harper Lee')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by title or author...');
      await user.type(searchInput, 'harper');

      await waitFor(() => {
        expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      });
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('Programming TypeScript')).not.toBeInTheDocument();
    });

    it('filters books by read status', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });

      const readButton = screen.getByRole('button', { name: 'Read' });
      await user.click(readButton);

      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('Programming TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });

    it('filters books by unread status', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      });

      const unreadButton = screen.getByRole('button', { name: 'Unread' });
      await user.click(unreadButton);

      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('Programming TypeScript')).not.toBeInTheDocument();
    });

    it('sorts books by year (newest first)', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Programming TypeScript')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText('Sort by');
      await user.click(sortSelect);
      
      const newestFirstOption = screen.getByText('Year (Newest first)');
      await user.click(newestFirstOption);

      await waitFor(() => {
        const bookTitles = screen.getAllByText(/^(The Great Gatsby|To Kill a Mockingbird|Programming TypeScript)$/);
        expect(bookTitles[0]).toHaveTextContent('Programming TypeScript');
      });
    });

    it('sorts books by author (A-Z)', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Boris Cherny')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText('Sort by');
      await user.click(sortSelect);
      
      const authorAZOption = screen.getByText('Author (A-Z)');
      await user.click(authorAZOption);

      await waitFor(() => {
        const bookTitles = screen.getAllByText(/^(The Great Gatsby|To Kill a Mockingbird|Programming TypeScript)$/);
        expect(bookTitles[0]).toHaveTextContent('Programming TypeScript');
      });
    });
  });

  describe('Add Book Functionality', () => {
    it('opens add book dialog when Add Book button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add book/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Book')).toBeInTheDocument();
    });

    it('successfully adds a new book', async () => {
      const user = userEvent.setup();
      const mocks = [getBooksSuccessMock, addBookSuccessMock];
      
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add book/i });
      await user.click(addButton);

      // Fill out the form
      const titleInput = screen.getByLabelText('Title');
      const authorInput = screen.getByLabelText('Author');
      const genreInput = screen.getByLabelText('Genre');
      const yearInput = screen.getByLabelText('Year');
      const pagesInput = screen.getByLabelText('Pages');
      const coverInput = screen.getByLabelText('Cover URL');

      await user.type(titleInput, 'New Test Book');
      await user.type(authorInput, 'Test Author');
      await user.type(genreInput, 'Test Genre');
      await user.type(yearInput, '2023');
      await user.type(pagesInput, '200');
      await user.type(coverInput, 'https://example.com/test.jpg');

      const submitButtons = screen.getAllByRole('button', { name: /add book/i });
      const submitButton = submitButtons.find(button => button.closest('[role="dialog"]'));
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes dialog when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add book/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles add book mutation error gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mocks = [getBooksSuccessMock, addBookErrorMock];
      
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add book/i });
      await user.click(addButton);

      // Fill out the form
      const titleInput = screen.getByLabelText('Title');
      const authorInput = screen.getByLabelText('Author');
      const genreInput = screen.getByLabelText('Genre');
      const yearInput = screen.getByLabelText('Year');
      const pagesInput = screen.getByLabelText('Pages');
      const coverInput = screen.getByLabelText('Cover URL');

      await user.type(titleInput, 'Error Book');
      await user.type(authorInput, 'Error Author');
      await user.type(genreInput, 'Error Genre');
      await user.type(yearInput, '2023');
      await user.type(pagesInput, '200');
      await user.type(coverInput, 'https://example.com/error.jpg');

      const submitButtons = screen.getAllByRole('button', { name: /add book/i });
      const submitButton = submitButtons.find(button => button.closest('[role="dialog"]'));
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to add book:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('No Books State', () => {
    it('displays "No books found" message when no books match search criteria', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by title or author...');
      await user.type(searchInput, 'nonexistent book');

      expect(screen.getByText('No books found')).toBeInTheDocument();
    });

    it('displays "No books found" when books array is empty', async () => {
      const emptyBooksMock = {
        request: {
          query: GET_BOOKS,
        },
        result: {
          data: {
            books: [],
          },
        },
      };

      render(
        <MockedProvider mocks={[emptyBooksMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No books found')).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('applies search filter and sort correctly', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });

      // Search for fiction books
      const searchInput = screen.getByPlaceholderText('Search by title or author...');
      await user.type(searchInput, 'fiction');

      // Should only show fiction books
      expect(screen.queryByText('Programming TypeScript')).not.toBeInTheDocument();
      
      // Sort by year ascending
      const sortSelect = screen.getByLabelText('Sort by');
      await user.click(sortSelect);
      
      const yearAscOption = screen.getByText('Year (Oldest first)');
      await user.click(yearAscOption);

      // Should show Great Gatsby first (1925) then To Kill a Mockingbird (1960)
      await waitFor(() => {
        const bookTitles = screen.getAllByText(/^(The Great Gatsby|To Kill a Mockingbird)$/);
        expect(bookTitles[0]).toHaveTextContent('The Great Gatsby');
      });
    });

    it('applies read filter and sort correctly', async () => {
      const user = userEvent.setup();
      render(
        <MockedProvider mocks={[getBooksSuccessMock]} addTypename={false}>
          <App />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      });

      // Filter for read books
      const readButton = screen.getByRole('button', { name: 'Read' });
      await user.click(readButton);

      // Should only show read books
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
      
      // Sort by pages descending
      const sortSelect = screen.getByLabelText('Sort by');
      await user.click(sortSelect);
      
      const pagesDescOption = screen.getByText('Pages (Most first)');
      await user.click(pagesDescOption);

      // Should show Programming TypeScript first (324 pages) then Great Gatsby (180 pages)
      await waitFor(() => {
        const bookTitles = screen.getAllByText(/^(The Great Gatsby|Programming TypeScript)$/);
        expect(bookTitles[0]).toHaveTextContent('Programming TypeScript');
      });
    });
  });
});