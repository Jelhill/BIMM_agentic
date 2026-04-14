import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { client } from '@/graphql/client';
import CarsList from '@/components/CarsList';

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

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Car Collection
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Browse and manage your favorite cars
            </Typography>
            <CarsList />
          </Box>
        </Container>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;