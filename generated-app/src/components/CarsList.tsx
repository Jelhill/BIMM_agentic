import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Button, Fab } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import CarCard from '@/components/CarCard';
import SearchAndSort from '@/components/SearchAndSort';
import AddCarForm from '@/components/AddCarForm';
import { useCars } from '@/hooks/useCars';
import type { Car, CarInput } from '@/types';

const CarsList: React.FC = () => {
  const { cars, loading, error, addCar } = useCars();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('year-desc');
  const [addFormOpen, setAddFormOpen] = useState(false);

  const filteredAndSortedCars = useMemo(() => {
    let filtered = cars.filter((car: Car) =>
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'year-asc':
        filtered.sort((a: Car, b: Car) => a.year - b.year);
        break;
      case 'year-desc':
        filtered.sort((a: Car, b: Car) => b.year - a.year);
        break;
      case 'make-asc':
        filtered.sort((a: Car, b: Car) => a.make.localeCompare(b.make));
        break;
      case 'make-desc':
        filtered.sort((a: Car, b: Car) => b.make.localeCompare(a.make));
        break;
      default:
        break;
    }

    return filtered;
  }, [cars, searchTerm, sortBy]);

  const handleAddCar = async (carData: CarInput) => {
    try {
      await addCar(carData);
    } catch (error) {
      console.error('Error adding car:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="error">
          Error loading cars: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <SearchAndSort
          searchTerm={searchTerm}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddFormOpen(true)}
          sx={{ ml: 2, height: 'fit-content' }}
        >
          Add Car
        </Button>
      </Box>

      <Grid2 container spacing={2}>
        {filteredAndSortedCars.map((car: Car) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={car.id}>
            <CarCard car={car} />
          </Grid2>
        ))}
      </Grid2>

      {filteredAndSortedCars.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Alert severity="info">
            No cars found matching your search criteria.
          </Alert>
        </Box>
      )}

      <AddCarForm
        open={addFormOpen}
        onClose={() => setAddFormOpen(false)}
        onSubmit={handleAddCar}
      />

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => setAddFormOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CarsList;