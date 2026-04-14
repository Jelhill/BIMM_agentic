import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { describe, it, expect } from 'vitest';
import { BooksList } from '@/components/BooksList';
import { GET_BOOKS } from '@/graphql/queries';

const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    year: 1925,
    pages: 180,
    read: true,
    cover: 'https://example.com/gatsby.jpg'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    pages: 281,
    read: false,
    cover: 'https://example.com/mockingbird.jpg'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian Fiction',
    year: 1949,
    pages: 328,
    read: true,
    cover: 'https://example.com/1984.jpg'
  }
];

const mocks = [
  {
    request: {
      query: GET_BOOKS,
    },
    result: {
      data: {
        books: mockBooks,
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_BOOKS,
    },
    error: new Error('Failed to fetch books'),
  },
];

const loadingMocks = [
  {
    request: {
      query: GET_BOOKS,
    },
    delay: 1000,
    result: {
      data: {
        books: mockBooks,
      },
    },
  },
];

const emptyMocks = [
  {
    request: {
      query: GET_BOOKS,
    },
    result: {
      data: {
        books: [],
      },
    },
  },
];

describe('BooksList', () => {
  const user = userEvent.setup();

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={loadingMocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders books after loading', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('by Harper Lee')).toBeInTheDocument();
    expect(screen.getByText('by George Orwell')).toBeInTheDocument();
  });

  it('renders error state when query fails', async () => {
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading books: Failed to fetch books/)).toBeInTheDocument();
    });
  });

  it('renders empty state when no books match criteria', async () => {
    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No books found matching your criteria.')).toBeInTheDocument();
    });
  });

  it('filters books by search term', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search by title or author');
    await user.type(searchInput, 'Gatsby');

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });
  });

  it('filters books by author search', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search by title or author');
    await user.type(searchInput, 'Orwell');

    await waitFor(() => {
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });
  });

  it('sorts books by year in ascending order', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const sortOrderSelect = screen.getByLabelText('Order');
    await user.click(sortOrderSelect);
    await user.click(screen.getByRole('option', { name: 'Ascending' }));

    await waitFor(() => {
      const bookCards = screen.getAllByText(/^\d{4}$/);
      expect(bookCards[0]).toHaveTextContent('1925');
      expect(bookCards[1]).toHaveTextContent('1949');
      expect(bookCards[2]).toHaveTextContent('1960');
    });
  });

  it('sorts books by author', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const sortFieldSelect = screen.getByLabelText('Sort by');
    await user.click(sortFieldSelect);
    await user.click(screen.getByRole('option', { name: 'Author' }));

    await waitFor(() => {
      const authorElements = screen.getAllByText(/^by /);
      expect(authorElements[0]).toHaveTextContent('by Harper Lee');
      expect(authorElements[1]).toHaveTextContent('by George Orwell');
      expect(authorElements[2]).toHaveTextContent('by F. Scott Fitzgerald');
    });
  });

  it('sorts books by pages', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const sortFieldSelect = screen.getByLabelText('Sort by');
    await user.click(sortFieldSelect);
    await user.click(screen.getByRole('option', { name: 'Pages' }));

    await waitFor(() => {
      const pageElements = screen.getAllByText(/\d+ pages/);
      expect(pageElements[0]).toHaveTextContent('328 pages');
      expect(pageElements[1]).toHaveTextContent('281 pages');
      expect(pageElements[2]).toHaveTextContent('180 pages');
    });
  });

  it('filters books by read status - read only', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const readButton = screen.getByRole('button', { name: 'read books' });
    await user.click(readButton);

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });
  });

  it('filters books by read status - unread only', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const unreadButton = screen.getByRole('button', { name: 'unread books' });
    await user.click(unreadButton);

    await waitFor(() => {
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search returns no matches', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search by title or author');
    await user.type(searchInput, 'nonexistent book');

    await waitFor(() => {
      expect(screen.getByText('No books found matching your criteria.')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
    });
  });

  it('combines search and filter functionality', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    const unreadButton = screen.getByRole('button', { name: 'unread books' });
    await user.click(unreadButton);

    const searchInput = screen.getByLabelText('Search by title or author');
    await user.type(searchInput, 'Kill');

    await waitFor(() => {
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });
  });

  it('renders search and sort controls', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BooksList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Search by title or author')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'all books' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'read books' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'unread books' })).toBeInTheDocument();
  });
});