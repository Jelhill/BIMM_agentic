import { useQuery, useMutation } from '@apollo/client';
import { GET_MOVIES, ADD_MOVIE } from '@/graphql/queries';

export interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  watched: boolean;
  poster: string;
}

export interface MovieInput {
  title: string;
  genre: string;
  year: number;
  rating: number;
  watched: boolean;
  poster: string;
}

export const useMovies = () => {
  const { data, loading, error, refetch } = useQuery(GET_MOVIES);
  
  const [addMovieMutation] = useMutation(ADD_MOVIE, {
    update(cache, { data }) {
      if (data?.addMovie) {
        const existingMovies = cache.readQuery({ query: GET_MOVIES });
        cache.writeQuery({
          query: GET_MOVIES,
          data: {
            movies: [...(existingMovies?.movies || []), data.addMovie],
          },
        });
      }
    },
  });

  const addMovie = async (input: MovieInput) => {
    try {
      await addMovieMutation({
        variables: { input },
      });
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    }
  };

  return {
    movies: (data?.movies as Movie[]) || [],
    loading,
    error,
    addMovie,
    refetch,
  };
};