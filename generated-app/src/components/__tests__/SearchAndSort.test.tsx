import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchAndSort from '@/components/SearchAndSort';

describe('SearchAndSort', () => {
  const mockProps = {
    searchTerm: '',
    sortBy: 'year-asc',
    onSearchChange: vi.fn(),
    onSortChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and sort select', () => {
    render(<SearchAndSort {...mockProps} />);
    
    expect(screen.getByLabelText(/search by model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it('displays current search term value', () => {
    render(<SearchAndSort {...mockProps} searchTerm="Toyota" />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    expect(searchInput).toHaveValue('Toyota');
  });

  it('displays current sort value', () => {
    render(<SearchAndSort {...mockProps} sortBy="make-desc" />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    expect(sortSelect).toHaveValue('make-desc');
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort {...mockProps} />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    await user.type(searchInput, 'Honda');
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('H');
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Ho');
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Hon');
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Hond');
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Honda');
  });

  it('calls onSortChange when sort option is selected', async () => {
    const user = userEvent.setup();
    render(<SearchAndSort {...mockProps} />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'make-asc');
    
    expect(mockProps.onSortChange).toHaveBeenCalledWith('make-asc');
  });

  it('renders all sort options correctly', () => {
    render(<SearchAndSort {...mockProps} />);
    
    expect(screen.getByText('Year (Ascending)')).toBeInTheDocument();
    expect(screen.getByText('Year (Descending)')).toBeInTheDocument();
    expect(screen.getByText('Make (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('Make (Z-A)')).toBeInTheDocument();
  });

  it('has correct placeholder text for search input', () => {
    render(<SearchAndSort {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Enter car model...');
    expect(searchInput).toBeInTheDocument();
  });
});