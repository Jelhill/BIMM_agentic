import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS, ADD_CAR } from '@/graphql/queries';
import { Car, CarInput } from '@/types';

interface GetCarsData {
  cars: Car[];
}

interface AddCarData {
  addCar: Car;
}

interface AddCarVariables {
  input: CarInput;
}

export function useCars() {
  const { data, loading, error, refetch } = useQuery<GetCarsData>(GET_CARS);

  const [addCarMutation] = useMutation<AddCarData, AddCarVariables>(ADD_CAR, {
    update(cache, { data }) {
      if (!data) return;

      const existingCars = cache.readQuery<GetCarsData>({
        query: GET_CARS,
      });

      if (existingCars) {
        cache.writeQuery({
          query: GET_CARS,
          data: {
            cars: [...existingCars.cars, data.addCar],
          },
        });
      }
    },
  });

  const addCar = async (input: CarInput) => {
    return await addCarMutation({
      variables: { input },
    });
  };

  return {
    cars: data?.cars || [],
    loading,
    error,
    addCar,
    refetch,
  };
}