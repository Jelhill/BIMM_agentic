import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchAndSort } from '@/components/SearchAndSort';

describe('SearchAndSort', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <SearchAndSort
        onSearchChange={mockOnSearchChange}
        onSortChange={mockOnSortChange}
        onFilterChange={mockOnFilterChange}
      />
    );
  };

  it('renders search input with correct placeholder', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders sort dropdown with default value', () => {
    renderComponent();
    
    const sortSelect = screen.getByDisplayValue('Year (Newest first)');
    expect(sortSelect).toBeInTheDocument();
  });

  it('renders filter toggle buttons with default selection', () => {
    renderComponent();
    
    const allBooksButton = screen.getByRole('button', { name: 'All Books' });
    const readButton = screen.getByRole('button', { name: 'Read' });
    const unreadButton = screen.getByRole('button', { name: 'Unread' });
    
    expect(allBooksButton).toBeInTheDocument();
    expect(readButton).toBeInTheDocument();
    expect(unreadButton).toBeInTheDocument();
    expect(allBooksButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSearchChange when search input changes', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith('test search');
  });

  it('calls onSortChange when sort option changes', () => {
    renderComponent();
    
    const sortSelect = screen.getByDisplayValue('Year (Newest first)');
    fireEvent.mouseDown(sortSelect);
    
    const authorAscOption = screen.getByText('Author (A-Z)');
    fireEvent.click(authorAscOption);
    
    expect(mockOnSortChange).toHaveBeenCalledTimes(1);
    expect(mockOnSortChange).toHaveBeenCalledWith('author_asc');
  });

  it('calls onFilterChange when filter toggle changes', () => {
    renderComponent();
    
    const readButton = screen.getByRole('button', { name: 'Read' });
    fireEvent.click(readButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith('read');
  });

  it('updates search input value when typed', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'Harry Potter' } });
    
    expect(searchInput).toHaveValue('Harry Potter');
  });

  it('does not call onFilterChange when same filter is clicked', () => {
    renderComponent();
    
    const allBooksButton = screen.getByRole('button', { name: 'All Books' });
    fireEvent.click(allBooksButton);
    
    expect(mockOnFilterChange).not.toHaveBeenCalled();
  });

  it('updates sort selection when different option is chosen', () => {
    renderComponent();
    
    const sortSelect = screen.getByDisplayValue('Year (Newest first)');
    fireEvent.mouseDown(sortSelect);
    
    const pagesDescOption = screen.getByText('Pages (Most first)');
    fireEvent.click(pagesDescOption);
    
    expect(screen.getByDisplayValue('Pages (Most first)')).toBeInTheDocument();
  });

  it('updates filter selection when different filter is chosen', () => {
    renderComponent();
    
    const unreadButton = screen.getByRole('button', { name: 'Unread' });
    fireEvent.click(unreadButton);
    
    expect(unreadButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls callbacks with correct types', () => {
    renderComponent();
    
    // Test search callback
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Test sort callback
    const sortSelect = screen.getByDisplayValue('Year (Newest first)');
    fireEvent.mouseDown(sortSelect);
    const yearAscOption = screen.getByText('Year (Oldest first)');
    fireEvent.click(yearAscOption);
    
    // Test filter callback
    const readButton = screen.getByRole('button', { name: 'Read' });
    fireEvent.click(readButton);
    
    expect(mockOnSearchChange).toHaveBeenCalledWith(expect.any(String));
    expect(mockOnSortChange).toHaveBeenCalledWith(expect.any(String));
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.any(String));
  });
});