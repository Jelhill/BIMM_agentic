export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  image: string;
}

export interface CreateCarInput {
  make: string;
  model: string;
  year: number;
  color: string;
  image: string;
}

export interface UpdateCarInput {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  image?: string;
}

export interface CarsQueryVariables {
  limit?: number;
  offset?: number;
}

export interface CarQueryVariables {
  id: string;
}

export interface CreateCarMutationVariables {
  input: CreateCarInput;
}

export interface UpdateCarMutationVariables {
  input: UpdateCarInput;
}

export interface DeleteCarMutationVariables {
  id: string;
}