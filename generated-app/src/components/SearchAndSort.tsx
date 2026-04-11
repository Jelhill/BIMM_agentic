import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Car } from '../types/car';

interface SearchAndSortProps {
  cars: Car[];
  onFilteredCarsChange: (cars: Car[]) => void;
}

type SortField = 'year' | 'make';
type SortDirection = 'asc' | 'desc';

const SearchAndSort: React.FC<SearchAndSortProps> = ({ cars, onFilteredCarsChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('year');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  React.useEffect(() => {
    let filteredCars = [...cars];

    // Filter by search term (model, case-insensitive)
    if (searchTerm.trim()) {
      filteredCars = filteredCars.filter(car =>
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by selected field and direction
    filteredCars.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      if (sortField === 'year') {
        valueA = a.year;
        valueB = b.year;
      } else {
        valueA = a.make.toLowerCase();
        valueB = b.make.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    onFilteredCarsChange(filteredCars);
  }, [cars, searchTerm, sortField, sortDirection, onFilteredCarsChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortFieldChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortField(event.target.value as SortField);
  };

  const handleSortDirectionChange = (
    event: React.MouseEvent<HTMLElement>,
    newDirection: SortDirection | null
  ) => {
    if (newDirection !== null) {
      setSortDirection(newDirection);
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Search by Model"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Enter model name..."
        fullWidth
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortField}
            onChange={handleSortFieldChange}
            label="Sort by"
          >
            <MenuItem value="year">Year</MenuItem>
            <MenuItem value="make">Make</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Order:</Typography>
          <ToggleButtonGroup
            value={sortDirection}
            exclusive
            onChange={handleSortDirectionChange}
            aria-label="sort direction"
            size="small"
          >
            <ToggleButton value="asc" aria-label="ascending">
              {sortField === 'year' ? 'Oldest First' : 'A-Z'}
            </ToggleButton>
            <ToggleButton value="desc" aria-label="descending">
              {sortField === 'year' ? 'Newest First' : 'Z-A'}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default SearchAndSort;