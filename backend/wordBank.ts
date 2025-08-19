// backend/wordBank.ts
export interface WordPair {
  word: string;
  category: string;
}

export const WORD_BANK: WordPair[] = [
  // Famous People
  { word: "LeBron James", category: "Famous Athlete" },
  { word: "Taylor Swift", category: "Famous Musician" },
  { word: "Elon Musk", category: "Famous CEO" },
  { word: "Gordon Ramsay", category: "Famous Chef" },
  { word: "Oprah Winfrey", category: "Famous TV Host" },
  
  // Foods
  { word: "Pizza", category: "Popular Food" },
  { word: "Sushi", category: "Popular Food" },
  { word: "Chocolate", category: "Sweet Food" },
  { word: "Hamburger", category: "Fast Food" },
  { word: "Ice Cream", category: "Dessert" },
  
  // Animals
  { word: "Elephant", category: "Large Animal" },
  { word: "Dolphin", category: "Sea Animal" },
  { word: "Tiger", category: "Wild Animal" },
  { word: "Penguin", category: "Bird" },
  { word: "Giraffe", category: "African Animal" },
  
  // Objects
  { word: "Smartphone", category: "Electronic Device" },
  { word: "Car", category: "Vehicle" },
  { word: "Guitar", category: "Musical Instrument" },
  { word: "Book", category: "Reading Material" },
  { word: "Bicycle", category: "Transportation" },
  
  // Places
  { word: "Paris", category: "Famous City" },
  { word: "Hawaii", category: "Vacation Destination" },
  { word: "Library", category: "Public Building" },
  { word: "Beach", category: "Outdoor Location" },
  { word: "Mountain", category: "Natural Formation" },
];

export function getRandomWord(): WordPair {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}