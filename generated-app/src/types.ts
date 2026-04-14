export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mobileImage: string;
  tabletImage: string;
  desktopImage: string;
}

export type CarInput = Omit<Car, 'id'>;