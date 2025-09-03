// backend/wordBank.ts

export interface WordPair {
  word: string;
  category: string;
}

export interface WordCategory {
  id: string;
  name: string;
  description: string;
  words: WordPair[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  categories: WordCategory[];
}

export const WORD_GROUPS: CategoryGroup[] = [
  {
    id: 'tft',
    name: 'TFT (Teamfight Tactics)',
    description: 'League of Legends auto-battler content',
    categories: [
      {
        id: 'tft-units',
        name: 'TFT Units',
        description: 'Champions and their characteristics',
        words: [
          { word: "Aatrox", category: "Frontline" },
          { word: "Ahri", category: "AP" },
          { word: "Akali", category: "Frontline" },
          { word: "Ashe", category: "Recommended Item: Guinsoos Rageblade" },
          { word: "Braum", category: "Cost ≥ 3" },
          { word: "Caitlyn", category: "Backline access" },
          { word: "Darius", category: "AD" },
          { word: "Ekko", category: "Support" },
          { word: "Ezreal", category: "Recommended Item: Spear of Shojin" },
          { word: "Garen", category: "Cost ≤ 3" },
          { word: "Gwen", category: "AP" },
          { word: "Janna", category: "Support" },
          { word: "Jarvan", category: "Frontline" },
          { word: "Jhin", category: "Recommended Item: Infinity Edge" },
          { word: "KSante", category: "Cost ≥ 3" },
          { word: "Katarina", category: "Backline access" },
          { word: "Kayle", category: "AP" },
          { word: "Kennen", category: "Bruiser" },
          { word: "Lux", category: "Recommended Item: Jeweled Gauntlet" },
          { word: "Malphite", category: "Cost ≤ 3" },
          { word: "Malzahar", category: "AP" },
          { word: "Neeko", category: "Frontline" },
          { word: "Poppy", category: "Bruiser" },
          { word: "Rakan", category: "Support" },
          { word: "Rell", category: "Frontline" },
          { word: "Ryze", category: "Recommended Item: Rabadons Deathcap" },
          { word: "Samira", category: "AD" },
          { word: "Senna", category: "Cost ≥ 3" },
          { word: "Seraphine", category: "AP" },
          { word: "Shen", category: "Frontline" },
          { word: "Sivir", category: "AD" },
          { word: "Swain", category: "Recommended Item: Gargoyle" },
          { word: "Syndra", category: "Recommended Item: Archangel" },
          { word: "Twisted Fate", category: "Backline" },
          { word: "Udyr", category: "Bruiser" },
          { word: "Varus", category: "Recommended Item: Last Whisper" },
          { word: "Vi", category: "Cost ≤ 3" },
          { word: "Viego", category: "AD" },
          { word: "Volibear", category: "Frontline" },
          { word: "Xayah", category: "Recommended Item: Krakens Fury" },
          { word: "Xin Zhao", category: "Tank" },
          { word: "Yasuo", category: "Backline access" },
          { word: "Yone", category: "Bruiser" }
        ]
      },
      {
        id: 'tft-augments',
        name: 'TFT Augments',
        description: 'Game-changing augment choices',
        words: [
          { word: "Trade Sector", category: "Augment - Econ (2-1)" },
          { word: "Clear Mind", category: "Augment - Gold (2-1)" },
          { word: "Prismatic Ticket", category: "Augment - Econ (2-1, 3-2)" },
          { word: "Call to Chaos", category: "Augment - Prismatic (4-2)" },
          { word: "Pandora's Bench", category: "Augment - Econ (2-1, 3-2)" },
          { word: "Birthday Present", category: "Augment - Prismatic (2-1)" },
          { word: "Level Up!", category: "Augment - Econ (2-1)" },
          { word: "Second Wind", category: "Augment - Combat (2-1, 3-2, 4-2)" },
          { word: "Climb The Ladder", category: "Augment - Combat (3-2, 4-2)" },
          { word: "Tiny Titans", category: "Augment - Combat (2-1)" },
          { word: "Stand United", category: "Augment - Combat (3-2, 4-2)" },
          { word: "High End Shopping", category: "Augment - Combat (2-1, 3-2)" },
          { word: "Radiant Relics", category: "Augment - Prismatic (2-1, 3-2, 4-2)" },
          { word: "Portable Forge", category: "Augment - Items (2-1, 3-2, 4-2)" },
          { word: "Pandora's Items", category: "Augment - Items (2-1, 3-2, 4-2)" },
          { word: "Item Grab Bag", category: "Augment - Items (3-2, 4-2)" },
          { word: "Lucky Gloves", category: "Augment - Prismatic (2-1, 3-2, 4-2)" },
          { word: "Salvage Bin", category: "Augment - Items (2-1, 3-2, 4-2)" },
          { word: "Worth The Wait", category: "Augment - Prismatic (2-1)" },
          { word: "Golemify", category: "Augment - Gold (3-2)" }
        ]
      }
    ]
  },
  {
    id: 'general',
    name: 'General Knowledge',
    description: 'Everyday topics everyone knows',
    categories: [
      {
        id: 'food',
        name: 'Food & Drinks',
        description: 'Popular foods and beverages',
        words: [
          { word: "Pizza", category: "Italian food" },
          { word: "Sushi", category: "Japanese food" },
          { word: "Tacos", category: "Mexican food" },
          { word: "Burger", category: "Fast food" },
          { word: "Pasta", category: "Italian food" },
          { word: "Ramen", category: "Japanese food" },
          { word: "Chocolate", category: "Sweet treat" },
          { word: "Coffee", category: "Hot beverage" },
          { word: "Ice Cream", category: "Frozen dessert" },
          { word: "Steak", category: "Meat dish" },
          { word: "Salad", category: "Healthy food" },
          { word: "Sandwich", category: "Lunch food" },
          { word: "Cereal", category: "Breakfast food" },
          { word: "Wine", category: "Alcoholic drink" },
          { word: "Apple", category: "Fruit" }
        ]
      },
      {
        id: 'movies',
        name: 'Movies & Shows',
        description: 'Famous films and TV series',
        words: [
          { word: "Avatar", category: "Sci-fi movie" },
          { word: "Titanic", category: "Romance movie" },
          { word: "Friends", category: "TV comedy show" },
          { word: "The Office", category: "TV comedy show" },
          { word: "Breaking Bad", category: "TV drama show" },
          { word: "Star Wars", category: "Sci-fi franchise" },
          { word: "Marvel", category: "Superhero franchise" },
          { word: "Harry Potter", category: "Fantasy franchise" },
          { word: "The Lion King", category: "Disney movie" },
          { word: "Frozen", category: "Animated movie" },
          { word: "Game of Thrones", category: "Fantasy TV show" },
          { word: "Stranger Things", category: "Netflix series" },
          { word: "The Batman", category: "Superhero movie" },
          { word: "Shrek", category: "Comedy movie" },
          { word: "Squid Game", category: "Korean series" }
        ]
      }
    ]
  }
];

// Helper function to get all words from selected categories
export function getWordsFromCategories(categoryIds: string[]): WordPair[] {
  const allWords: WordPair[] = [];
  
  for (const group of WORD_GROUPS) {
    for (const category of group.categories) {
      if (categoryIds.includes(category.id)) {
        allWords.push(...category.words);
      }
    }
  }
  
  return allWords;
}

// Helper function to get all categories (flattened)
export function getAllCategories(): WordCategory[] {
  const allCategories: WordCategory[] = [];
  
  for (const group of WORD_GROUPS) {
    allCategories.push(...group.categories);
  }
  
  return allCategories;
}

// Updated random word function - now works with selected categories
export function getRandomWord(categoryIds?: string[]): WordPair {
  let availableWords: WordPair[];
  
  if (categoryIds && categoryIds.length > 0) {
    availableWords = getWordsFromCategories(categoryIds);
  } else {
    // Fallback to all words if no categories selected
    availableWords = getAllCategories().flatMap(category => category.words);
  }
  
  if (availableWords.length === 0) {
    // Emergency fallback - use all words
    availableWords = getAllCategories().flatMap(category => category.words);
  }
  
  return availableWords[Math.floor(Math.random() * availableWords.length)];
}