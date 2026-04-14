import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchAndSort, filterBooks, sortBooks, filterByReadStatus } from '@/components/SearchAndSort';
import { Book } from '@/types';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    year: 1925,
    pages: 180,
    read: true,
    cover: 'gatsby.jpg'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    year: 1949,
    pages: 328,
    read: false,
    cover: '1984.jpg'
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    pages: 376,
    read: true,
    cover: 'mockingbird.jpg'
  }
];

describe('SearchAndSort', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnReadFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <SearchAndSort
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
        onReadFilterChange={mockOnReadFilterChange}
      />
    );
  };

  it('renders all form elements correctly', () => {
    renderComponent();

    expect(screen.getByRole('textbox', { name: /search by title or author/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /order/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all books/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /read books/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unread books/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when user types in search field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByRole('textbox', { name: /search by title or author/i });
    await user.type(searchInput, 'gatsby');

    expect(mockOnSearchChange).toHaveBeenCalledWith('gatsby');
  });

  it('calls onSortChange when sort field is changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.click(sortSelect);
    await user.click(screen.getByRole('option', { name: /pages/i }));

    expect(mockOnSortChange).toHaveBeenCalledWith('pages', 'desc');
  });

  it('calls onSortChange when sort order is changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const orderSelect = screen.getByRole('combobox', { name: /order/i });
    await user.click(orderSelect);
    await user.click(screen.getByRole('option', { name: /ascending/i }));

    expect(mockOnSortChange).toHaveBeenCalledWith('year', 'asc');
  });

  it('calls onReadFilterChange when read status filter is changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const readButton = screen.getByRole('button', { name: /read books/i });
    await user.click(readButton);

    expect(mockOnReadFilterChange).toHaveBeenCalledWith('read');
  });

  it('calls onReadFilterChange when unread status filter is changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const unreadButton = screen.getByRole('button', { name: /unread books/i });
    await user.click(unreadButton);

    expect(mockOnReadFilterChange).toHaveBeenCalledWith('unread');
  });
});

describe('filterBooks', () => {
  it('returns all books when search term is empty', () => {
    const result = filterBooks(mockBooks, '');
    expect(result).toEqual(mockBooks);
  });

  it('filters books by title', () => {
    const result = filterBooks(mockBooks, 'gatsby');
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('The Great Gatsby');
  });

  it('filters books by author', () => {
    const result = filterBooks(mockBooks, 'orwell');
    expect(result).toHaveLength(1);
    expect(result[0]!.author).toBe('George Orwell');
  });

  it('performs case-insensitive search', () => {
    const result = filterBooks(mockBooks, 'GATSBY');
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('The Great Gatsby');
  });

  it('returns empty array when no matches found', () => {
    const result = filterBooks(mockBooks, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('sortBooks', () => {
  it('sorts books by year in ascending order', () => {
    const result = sortBooks(mockBooks, 'year', 'asc');
    expect(result[0]!.year).toBe(1925);
    expect(result[1]!.year).toBe(1949);
    expect(result[2]!.year).toBe(1960);
  });

  it('sorts books by year in descending order', () => {
    const result = sortBooks(mockBooks, 'year', 'desc');
    expect(result[0]!.year).toBe(1960);
    expect(result[1]!.year).toBe(1949);
    expect(result[2]!.year).toBe(1925);
  });

  it('sorts books by pages in ascending order', () => {
    const result = sortBooks(mockBooks, 'pages', 'asc');
    expect(result[0]!.pages).toBe(180);
    expect(result[1]!.pages).toBe(328);
    expect(result[2]!.pages).toBe(376);
  });

  it('sorts books by pages in descending order', () => {
    const result = sortBooks(mockBooks, 'pages', 'desc');
    expect(result[0]!.pages).toBe(376);
    expect(result[1]!.pages).toBe(328);
    expect(result[2]!.pages).toBe(180);
  });

  it('sorts books by author in ascending order', () => {
    const result = sortBooks(mockBooks, 'author', 'asc');
    expect(result[0]!.author).toBe('F. Scott Fitzgerald');
    expect(result[1]!.author).toBe('George Orwell');
    expect(result[2]!.author).toBe('Harper Lee');
  });

  it('sorts books by author in descending order', () => {
    const result = sortBooks(mockBooks, 'author', 'desc');
    expect(result[0]!.author).toBe('Harper Lee');
    expect(result[1]!.author).toBe('George Orwell');
    expect(result[2]!.author).toBe('F. Scott Fitzgerald');
  });

  it('does not mutate original array', () => {
    const original = [...mockBooks];
    sortBooks(mockBooks, 'year', 'asc');
    expect(mockBooks).toEqual(original);
  });
});

describe('filterByReadStatus', () => {
  it('returns all books when filter is "all"', () => {
    const result = filterByReadStatus(mockBooks, 'all');
    expect(result).toEqual(mockBooks);
  });

  it('returns only read books when filter is "read"', () => {
    const result = filterByReadStatus(mockBooks, 'read');
    expect(result).toHaveLength(2);
    expect(result.every(book => book.read)).toBe(true);
  });

  it('returns only unread books when filter is "unread"', () => {
    const result = filterByReadStatus(mockBooks, 'unread');
    expect(result).toHaveLength(1);
    expect(result.every(book => !book.read)).toBe(true);
  });
});