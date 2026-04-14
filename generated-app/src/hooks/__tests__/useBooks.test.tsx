import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { useBooks } from '@/hooks/useBooks';
import { GET_BOOKS, ADD_BOOK } from '@/graphql/queries';
import type { Book, BookInput } from '@/types';
import { ReactNode } from 'react';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    year: 1925,
    pages: 180,
    read: true,
    cover: 'gatsby.jpg',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian Fiction',
    year: 1949,
    pages: 328,
    read: false,
    cover: '1984.jpg',
  },
];

const newBook: BookInput = {
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  genre: 'Fiction',
  year: 1960,
  pages: 281,
  read: false,
  cover: 'mockingbird.jpg',
};

const newBookWithId: Book = {
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

  it('should return loading state initially', () => {
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

  it('should return books data on successful fetch', async () => {
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
    const errorMocks = [
      {
        request: {
          query: GET_BOOKS,
        },
        error: new Error('Network error'),
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(errorMocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should handle GraphQL errors', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_BOOKS,
        },
        result: {
          errors: [new GraphQLError('GraphQL error')],
        },
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(errorMocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should add a book and update cache', async () => {
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
            addBook: newBookWithId,
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

    const addedBook = await result.current.addBook(newBook);

    expect(addedBook).toEqual(newBookWithId);
    
    await waitFor(() => {
      expect(result.current.books).toEqual([...mockBooks, newBookWithId]);
    });
  });

  it('should handle addBook mutation error', async () => {
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
        error: new Error('Failed to add book'),
      },
    ];

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.addBook(newBook)).rejects.toThrow('Failed to add book');
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
      {
        request: {
          query: GET_BOOKS,
        },
        result: {
          data: {
            books: [...mockBooks, newBookWithId],
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
    expect(typeof result.current.refetch).toBe('function');

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.books).toEqual([...mockBooks, newBookWithId]);
    });
  });

  it('should handle cache update when no existing data', async () => {
    const mocks = [
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
      {
        request: {
          query: ADD_BOOK,
          variables: {
            input: newBook,
          },
        },
        result: {
          data: {
            addBook: newBookWithId,
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

    const addedBook = await result.current.addBook(newBook);

    expect(addedBook).toEqual(newBookWithId);
    
    await waitFor(() => {
      expect(result.current.books).toEqual([newBookWithId]);
    });
  });
});