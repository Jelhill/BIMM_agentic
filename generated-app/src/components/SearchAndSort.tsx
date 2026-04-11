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
  SelectChangeEvent
} from '@mui/material';
import { Movie } from '@/types';

export type SortOption = 'year-asc' | 'year-desc' | 'rating-desc';
export type WatchedFilter = 'all' | 'watched' | 'unwatched';

interface SearchAndSortProps {
  movies: Movie[];
  onFilteredMoviesChange: (filteredMovies: Movie[]) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({
  movies,
  onFilteredMoviesChange
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState<SortOption>('year-desc');
  const [watchedFilter, setWatchedFilter] = React.useState<WatchedFilter>('all');

  const filterAndSortMovies = React.useCallback(
    (search: string, sort: SortOption, watched: WatchedFilter) => {
      let filtered = [...movies];

      // Filter by search term
      if (search.trim()) {
        filtered = filtered.filter(movie =>
          movie.title.toLowerCase().includes(search.toLowerCase()) ||
          movie.genre.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by watched status
      if (watched === 'watched') {
        filtered = filtered.filter(movie => movie.watched);
      } else if (watched === 'unwatched') {
        filtered = filtered.filter(movie => !movie.watched);
      }

      // Sort movies
      filtered.sort((a, b) => {
        switch (sort) {
          case 'year-asc':
            return a.year - b.year;
          case 'year-desc':
            return b.year - a.year;
          case 'rating-desc':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });

      return filtered;
    },
    [movies]
  );

  React.useEffect(() => {
    const filteredMovies = filterAndSortMovies(searchTerm, sortOption, watchedFilter);
    onFilteredMoviesChange(filteredMovies);
  }, [searchTerm, sortOption, watchedFilter, filterAndSortMovies, onFilteredMoviesChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortOption(event.target.value as SortOption);
  };

  const handleWatchedFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: WatchedFilter | null
  ) => {
    if (newFilter !== null) {
      setWatchedFilter(newFilter);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        label="Search movies..."
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ minWidth: 200, flex: 1 }}
      />
      
      <FormControl sx={{ minWidth: 160 }}>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={sortOption}
          label="Sort by"
          onChange={handleSortChange}
        >
          <MenuItem value="year-desc">Year (Newest)</MenuItem>
          <MenuItem value="year-asc">Year (Oldest)</MenuItem>
          <MenuItem value="rating-desc">Rating (High to Low)</MenuItem>
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={watchedFilter}
        exclusive
        onChange={handleWatchedFilterChange}
        size="small"
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="watched">Watched</ToggleButton>
        <ToggleButton value="unwatched">Unwatched</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};