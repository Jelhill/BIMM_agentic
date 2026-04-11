import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchAndSort from '../components/SearchAndSort';

describe('SearchAndSort', () => {
  const defaultProps = {
    onSearchChange: vi.fn(),
    onSortChange: vi.fn(),
    searchTerm: '',
    sortBy: 'year' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and sort select', () => {
    render(<SearchAndSort {...defaultProps} />);
    
    expect(screen.getByLabelText(/search by model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it('displays the current search term in the input', () => {
    const searchTerm = 'Toyota Camry';
    render(<SearchAndSort {...defaultProps} searchTerm={searchTerm} />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    expect(searchInput).toHaveValue(searchTerm);
  });

  it('displays the current sort value in the select', () => {
    render(<SearchAndSort {...defaultProps} sortBy="make" />);
    
    const sortSelect = screen.getByDisplayValue('Make');
    expect(sortSelect).toBeInTheDocument();
  });

  it('calls onSearchChange when search input value changes', () => {
    const onSearchChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    fireEvent.change(searchInput, { target: { value: 'Honda' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('Honda');
  });

  it('calls onSearchChange with case-insensitive handling', () => {
    const onSearchChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    fireEvent.change(searchInput, { target: { value: 'HONDA' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('HONDA');
  });

  it('calls onSortChange when sort selection changes to year', () => {
    const onSortChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSortChange={onSortChange} sortBy="make" />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    
    const yearOption = screen.getByText('Year');
    fireEvent.click(yearOption);
    
    expect(onSortChange).toHaveBeenCalledWith('year');
  });

  it('calls onSortChange when sort selection changes to make', () => {
    const onSortChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSortChange={onSortChange} sortBy="year" />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    
    const makeOption = screen.getByText('Make');
    fireEvent.click(makeOption);
    
    expect(onSortChange).toHaveBeenCalledWith('make');
  });

  it('shows placeholder text in search input', () => {
    render(<SearchAndSort {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Enter model name...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles multiple search term changes correctly', () => {
    const onSearchChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    
    fireEvent.change(searchInput, { target: { value: 'T' } });
    fireEvent.change(searchInput, { target: { value: 'To' } });
    fireEvent.change(searchInput, { target: { value: 'Toyota' } });
    
    expect(onSearchChange).toHaveBeenCalledTimes(3);
    expect(onSearchChange).toHaveBeenNthCalledWith(1, 'T');
    expect(onSearchChange).toHaveBeenNthCalledWith(2, 'To');
    expect(onSearchChange).toHaveBeenNthCalledWith(3, 'Toyota');
  });

  it('handles empty search term', () => {
    const onSearchChange = vi.fn();
    render(<SearchAndSort {...defaultProps} onSearchChange={onSearchChange} searchTerm="Honda" />);
    
    const searchInput = screen.getByLabelText(/search by model/i);
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('renders both sort options correctly', () => {
    render(<SearchAndSort {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Make')).toBeInTheDocument();
  });
});