import React, { useState, useCallback, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { apolloClient } from './apollo/client';
import { CarsList } from './components/CarsList';
import { AddCarForm } from './components/AddCarForm';
import { SearchAndSort } from './components/SearchAndSort';
import { useCars } from './hooks/useCars';
import type { Car } from './types/car';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function CarInventory() {
  const { cars, loading, error } = useCars();
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleFilteredCarsChange = useCallback((sorted: Car[]) => {
    setFilteredCars(sorted);
  }, []);

  const displayCars = cars.length > 0 ? filteredCars : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Car Inventory
        </Typography>
        <Button variant="contained" onClick={() => setAddDialogOpen(true)}>
          Add Car
        </Button>
      </Box>

      {cars.length > 0 && (
        <SearchAndSort cars={cars} onFilteredCarsChange={handleFilteredCarsChange} />
      )}

      {loading && <Typography>Loading cars...</Typography>}
      {error && <Typography color="error">Error: {error.message}</Typography>}

      <CarsList cars={displayCars} />

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Car</DialogTitle>
        <DialogContent>
          <AddCarForm onSuccess={() => setAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CarInventory />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
