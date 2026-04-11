import { gql } from '@apollo/client';

export const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      title
      genre
      year
      rating
      watched
      poster
    }
  }
`;

export const ADD_MOVIE = gql`
  mutation AddMovie($input: MovieInput!) {
    addMovie(input: $input) {
      id
      title
      genre
      year
      rating
      watched
      poster
    }
  }
`;