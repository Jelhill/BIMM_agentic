import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';

interface SearchAndSortProps {
  onSearchChange: (searchTerm: string) => void;
  onSortChange: (sortBy: 'year' | 'make') => void;
  searchTerm: string;
  sortBy: 'year' | 'make';
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  onSearchChange,
  onSortChange,
  searchTerm,
  sortBy
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<'year' | 'make'>) => {
    onSortChange(event.target.value as 'year' | 'make');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap'
      }}
    >
      <TextField
        label="Search by model"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ minWidth: 200, flex: 1 }}
        placeholder="Enter model name..."
      />
      
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="sort-select-label">Sort by</InputLabel>
        <Select
          labelId="sort-select-label"
          value={sortBy}
          label="Sort by"
          onChange={handleSortChange}
        >
          <MenuItem value="year">Year</MenuItem>
          <MenuItem value="make">Make</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchAndSort;