import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Book } from '@/types';

export type SortField = 'year' | 'pages' | 'author';
export type SortOrder = 'asc' | 'desc';
export type ReadFilter = 'all' | 'read' | 'unread';

interface SearchAndSortProps {
  onSearchChange: (searchTerm: string) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onReadFilterChange: (filter: ReadFilter) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({
  onSearchChange,
  onSortChange,
  onReadFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSortFieldChange = (event: SelectChangeEvent) => {
    const field = event.target.value as SortField;
    setSortField(field);
    onSortChange(field, sortOrder);
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    const order = event.target.value as SortOrder;
    setSortOrder(order);
    onSortChange(sortField, order);
  };

  const handleReadFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: ReadFilter
  ) => {
    if (newFilter !== null) {
      setReadFilter(newFilter);
      onReadFilterChange(newFilter);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search and Filter
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search by title or author"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortField}
            label="Sort by"
            onChange={handleSortFieldChange}
          >
            <MenuItem value="year">Year</MenuItem>
            <MenuItem value="pages">Pages</MenuItem>
            <MenuItem value="author">Author</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Order</InputLabel>
          <Select
            value={sortOrder}
            label="Order"
            onChange={handleSortOrderChange}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Read Status
          </Typography>
          <ToggleButtonGroup
            value={readFilter}
            exclusive
            onChange={handleReadFilterChange}
            aria-label="read status filter"
          >
            <ToggleButton value="all" aria-label="all books">
              All
            </ToggleButton>
            <ToggleButton value="read" aria-label="read books">
              Read
            </ToggleButton>
            <ToggleButton value="unread" aria-label="unread books">
              Unread
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export const filterBooks = (books: Book[], searchTerm: string): Book[] => {
  if (!searchTerm) return books;
  
  const term = searchTerm.toLowerCase();
  return books.filter(
    book =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
  );
};

export const sortBooks = (books: Book[], field: SortField, order: SortOrder): Book[] => {
  return [...books].sort((a, b) => {
    let comparison = 0;
    
    switch (field) {
      case 'year':
        comparison = a.year - b.year;
        break;
      case 'pages':
        comparison = a.pages - b.pages;
        break;
      case 'author':
        comparison = a.author.localeCompare(b.author);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

export const filterByReadStatus = (books: Book[], filter: ReadFilter): Book[] => {
  switch (filter) {
    case 'read':
      return books.filter(book => book.read);
    case 'unread':
      return books.filter(book => !book.read);
    case 'all':
    default:
      return books;
  }
};

export default SearchAndSort;