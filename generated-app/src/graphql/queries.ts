import { gql } from '@apollo/client';

export const GET_CARS = gql`
  query GetCars {
    cars {
      id
      make
      model
      year
      color
      mobileImage
      tabletImage
      desktopImage
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
      mobileImage
      tabletImage
      desktopImage
    }
  }
`;

export const ADD_CAR = gql`
  mutation AddCar($input: CarInput!) {
    addCar(input: $input) {
      id
      make
      model
      year
      color
      mobileImage
      tabletImage
      desktopImage
    }
  }
`;