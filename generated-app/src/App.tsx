import React, { useState, useMemo } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Fab,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ApolloProvider } from '@apollo/client';
import client from './apollo/client';
import CarsList from './components/CarsList';
import AddCarForm from './components/AddCarForm';
import SearchAndSort from './components/SearchAndSort';
import { useCars } from './hooks/useCars';
import { Car } from './types/car';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          position: 'fixed',
          bottom: 24,
          right: 24,
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { cars, loading, error } = useCars();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'year' | 'make'>('year');

  const filteredAndSortedCars = useMemo(() => {
    let filtered = cars;

    // Filter by search term (model)
    if (searchTerm.trim()) {
      filtered = cars.filter((car) =>
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort cars
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'year') {
        return b.year - a.year; // Newest first
      } else {
        return a.make.localeCompare(b.make); // Alphabetical by make
      }
    });

    return sorted;
  }, [cars, searchTerm, sortBy]);

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Car Gallery
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Car Collection
        </Typography>

        <SearchAndSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <Box sx={{ mb: 4 }}>
          {loading ? (
            <CarsList />
          ) : error ? (
            <CarsList />
          ) : (
            <CarsListWithFiltering cars={filteredAndSortedCars} />
          )}
        </Box>
      </Container>

      <Fab color="primary" aria-label="add car" onClick={handleOpenAddForm}>
        <AddIcon />
      </Fab>

      <AddCarForm open={isAddFormOpen} onClose={handleCloseAddForm} />
    </>
  );
};

interface CarsListWithFilteringProps {
  cars: Car[];
}

const CarsListWithFiltering: React.FC<CarsListWithFilteringProps> = ({ cars }) => {
  if (cars.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography variant="h6" color="text.secondary">
          No cars match your search criteria.
        </Typography>
      </Box>
    );
  }

  return <CarsList />;
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;