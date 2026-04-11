import { gql } from '@apollo/client';

export const GET_CARS = gql`
  query GetCars {
    cars {
      id
      make
      model
      year
      color
      image
    }
  }
`;

export const ADD_CAR = gql`
  mutation AddCar($input: AddCarInput!) {
    addCar(input: $input) {
      id
      make
      model
      year
      color
      image
    }
  }
`;
