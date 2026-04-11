import { gql } from '@apollo/client';

export const typeDefs = gql`
  type Car {
    id: ID!
    make: String!
    model: String!
    year: Int!
    color: String!
    image: String!
  }

  input CarInput {
    make: String!
    model: String!
    year: Int!
    color: String!
    image: String!
  }

  type Query {
    cars: [Car!]!
  }

  type Mutation {
    addCar(input: CarInput!): Car!
  }
`;

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
  mutation AddCar($input: CarInput!) {
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