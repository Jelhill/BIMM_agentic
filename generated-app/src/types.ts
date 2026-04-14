export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  read: boolean;
  cover: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  price: number;
}