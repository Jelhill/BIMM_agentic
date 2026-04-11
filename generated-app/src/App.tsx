import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Container, Typography, Fab, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CarsList } from './components/CarsList';
import { AddCarForm } from './components/AddCarForm';
import SearchAndSort from './components/SearchAndSort';
import { apolloClient } from './graphql/client';
import { Car } from './types/car';
import { useCars } from './hooks/useCars';

// Initialize MSW
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  worker.start();
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppContent: React.FC = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const { cars } = useCars();

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleFilteredCarsChange = (cars: Car[]) => {
    setFilteredCars(cars);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Car Inventory
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your car collection
        </Typography>
      </Box>

      <SearchAndSort
        cars={cars}
        onFilteredCarsChange={handleFilteredCarsChange}
      />

      <CarsList />

      <Fab
        color="primary"
        aria-label="add car"
        onClick={handleOpenAddForm}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      <AddCarForm
        open={isAddFormOpen}
        onClose={handleCloseAddForm}
      />
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;