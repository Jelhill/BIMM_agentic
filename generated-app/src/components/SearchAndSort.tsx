import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2';

interface SearchAndSortProps {
  searchTerm: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  searchTerm,
  sortBy,
  onSearchChange,
  onSortChange
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Search by model"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Enter car model..."
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="year-asc">Year (Ascending)</MenuItem>
              <MenuItem value="year-desc">Year (Descending)</MenuItem>
              <MenuItem value="make-asc">Make (A-Z)</MenuItem>
              <MenuItem value="make-desc">Make (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default SearchAndSort;