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
  SelectChangeEvent,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';

export type SortOption = 'year_asc' | 'year_desc' | 'pages_asc' | 'pages_desc' | 'author_asc' | 'author_desc';
export type FilterOption = 'all' | 'read' | 'unread';

interface SearchAndSortProps {
  onSearchChange: (searchTerm: string) => void;
  onSortChange: (sortOption: SortOption) => void;
  onFilterChange: (filterOption: FilterOption) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({
  onSearchChange,
  onSortChange,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState<SortOption>('year_desc');
  const [filterOption, setFilterOption] = React.useState<FilterOption>('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    const value = event.target.value as SortOption;
    setSortOption(value);
    onSortChange(value);
  };

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: FilterOption | null,
  ) => {
    if (newFilter !== null) {
      setFilterOption(newFilter);
      onFilterChange(newFilter);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid2 container spacing={2} alignItems="center">
        <Grid2 size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Search books"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
          />
        </Grid2>
        
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortOption}
              label="Sort by"
              onChange={handleSortChange}
            >
              <MenuItem value="year_desc">Year (Newest first)</MenuItem>
              <MenuItem value="year_asc">Year (Oldest first)</MenuItem>
              <MenuItem value="pages_asc">Pages (Fewest first)</MenuItem>
              <MenuItem value="pages_desc">Pages (Most first)</MenuItem>
              <MenuItem value="author_asc">Author (A-Z)</MenuItem>
              <MenuItem value="author_desc">Author (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Read Status
            </Typography>
            <ToggleButtonGroup
              value={filterOption}
              exclusive
              onChange={handleFilterChange}
              size="small"
            >
              <ToggleButton value="all">All Books</ToggleButton>
              <ToggleButton value="read">Read</ToggleButton>
              <ToggleButton value="unread">Unread</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default SearchAndSort;