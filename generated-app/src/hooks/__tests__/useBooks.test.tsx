import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { GET_BOOKS, ADD_BOOK } from '@/graphql/queries';
import type { Book } from '@/types';

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
];

const newBook = {
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  genre: 'Fiction',
  year: 1960,
  pages: 281,
  read: false,
  cover: 'https://example.com/mockingbird.jpg',
};

const addedBook: Book = {
  id: '3',
  ...newBook,
};

describe('useBooks', () => {
  const createWrapper = (mocks: any[]) => {
    return ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', async () => {
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

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch books successfully', async () => {
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

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle error state', async () => {
    const errorMessage = 'Failed to fetch books';
    const mocks = [
      {
        request: {
          query: GET_BOOKS,
        },
        error: new Error(errorMessage),
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should add a book successfully', async () => {
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
      {
        request: {
          query: ADD_BOOK,
          variables: {
            input: newBook,
          },
        },
        result: {
          data: {
            addBook: addedBook,
          },
        },
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks);

    const addedBookResult = await result.current.addBook(newBook);

    expect(addedBookResult).toEqual(addedBook);
  });

  it('should handle add book error', async () => {
    const errorMessage = 'Failed to add book';
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
      {
        request: {
          query: ADD_BOOK,
          variables: {
            input: newBook,
          },
        },
        error: new Error(errorMessage),
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.addBook(newBook)).rejects.toThrow(errorMessage);
  });

  it('should provide refetch function', async () => {
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

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should update cache after adding book', async () => {
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
      {
        request: {
          query: ADD_BOOK,
          variables: {
            input: newBook,
          },
        },
        result: {
          data: {
            addBook: addedBook,
          },
        },
      },
      {
        request: {
          query: GET_BOOKS,
        },
        result: {
          data: {
            books: [...mockBooks, addedBook],
          },
        },
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks);

    await result.current.addBook(newBook);

    // The cache should be updated automatically through the update function
    // but we need to wait for the next render cycle
    await waitFor(() => {
      expect(result.current.books).toEqual([...mockBooks, addedBook]);
    });
  });
});