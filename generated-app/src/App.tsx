import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/graphql/client';
import { BooksList } from '@/components/BooksList';
import { AddBookForm } from '@/components/AddBookForm';
import AddIcon from '@mui/icons-material/Add';

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

function App() {
  const [addBookOpen, setAddBookOpen] = useState(false);

  const handleAddBookOpen = () => {
    setAddBookOpen(true);
  };

  const handleAddBookClose = () => {
    setAddBookOpen(false);
  };

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My Book Library
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleAddBookOpen}
            >
              Add Book
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl">
          <Box sx={{ mt: 4, mb: 4 }}>
            <BooksList />
          </Box>
        </Container>
        <AddBookForm open={addBookOpen} onClose={handleAddBookClose} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;