import { gql } from '@apollo/client';

export const GET_CARS = gql`
  query GetCars($limit: Int, $offset: Int) {
    cars(limit: $limit, offset: $offset) {
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
  mutation AddCar($input: CreateCarInput!) {
    createCar(input: $input) {
      id
      make
      model
      year
      color
      image
    }
  }
`;

export const UPDATE_CAR = gql`
  mutation UpdateCar($input: UpdateCarInput!) {
    updateCar(input: $input) {
      id
      make
      model
      year
      color
      image
    }
  }
`;

export const DELETE_CAR = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id) {
      id
    }
  }
`;

export const GET_CAR = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      make
      model
      year
      color
      image
    }
  }
`;