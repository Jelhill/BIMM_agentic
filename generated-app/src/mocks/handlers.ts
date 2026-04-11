import { graphql, HttpResponse } from 'msw';
import { mockMovies } from '@/mocks/data';
import { Movie } from '@/types';

let movies: Movie[] = [...mockMovies];

export const handlers = [
  graphql.query('GetMovies', () => {
    return HttpResponse.json({
      data: {
        movies: movies
      }
    });
  }),

  graphql.mutation('AddMovie', async ({ request }) => {
    const { input } = await request.json() as { input: Omit<Movie, 'id'> };
    
    const newMovie: Movie = {
      id: (movies.length + 1).toString(),
      ...input
    };

    movies.push(newMovie);

    return HttpResponse.json({
      data: {
        addMovie: newMovie
      }
    });
  })
];