export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  image?: string;
}

export interface CreateCarInput {
  make: string;
  model: string;
  year: number;
  color: string;
  image?: string;
}

export interface UpdateCarInput {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  image?: string;
}

export interface CarsResponse {
  cars: Car[];
}

export interface CarResponse {
  car: Car;
}

export interface CreateCarResponse {
  createCar: Car;
}

export interface UpdateCarResponse {
  updateCar: Car;
}

export interface DeleteCarResponse {
  deleteCar: {
    id: string;
  };
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}