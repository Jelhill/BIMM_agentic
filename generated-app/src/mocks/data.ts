import { Book } from '@/types';

export const seedBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic Literature',
    year: 1925,
    pages: 180,
    read: true,
    cover: 'https://covers.openlibrary.org/b/id/8225261-L.jpg'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    pages: 281,
    read: true,
    cover: 'https://covers.openlibrary.org/b/id/8226506-L.jpg'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian Fiction',
    year: 1949,
    pages: 328,
    read: false,
    cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    year: 1813,
    pages: 432,
    read: true,
    cover: 'https://covers.openlibrary.org/b/id/8091016-L.jpg'
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: 'Coming-of-age Fiction',
    year: 1951,
    pages: 277,
    read: false,
    cover: 'https://covers.openlibrary.org/b/id/8091017-L.jpg'
  },
  {
    id: '6',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    year: 1954,
    pages: 1216,
    read: true,
    cover: 'https://covers.openlibrary.org/b/id/8091018-L.jpg'
  },
  {
    id: '7',
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 1997,
    pages: 223,
    read: true,
    cover: 'https://covers.openlibrary.org/b/id/8091019-L.jpg'
  }
];

export const seedCars = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2022, color: 'Blue', price: 25000 },
  { id: '2', make: 'Honda', model: 'Civic', year: 2021, color: 'Red', price: 22000 },
  { id: '3', make: 'Ford', model: 'Mustang', year: 2023, color: 'Yellow', price: 35000 }
];

let nextBookId = 8;

export const generateBookId = (): string => {
  return (nextBookId++).toString();
};

export const addBookToMockData = (book: Omit<Book, 'id'>): Book => {
  const newBook: Book = {
    ...book,
    id: generateBookId()
  };
  seedBooks.push(newBook);
  return newBook;
};