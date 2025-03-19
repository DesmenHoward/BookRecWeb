// Map of genres to pun nicknames
export const genrePuns: Record<string, string[]> = {
  'Fiction': [
    'The Plot Twister',
    'Novel Enthusiast',
    'Fiction Friction',
    'Page Turner Pro'
  ],
  'Fantasy': [
    'Dragon Bookkeeper',
    'Spell Binder',
    'Magic Word Wizard',
    'Fantasy Fanatic'
  ],
  'Science Fiction': [
    'Space Bookworm',
    'Time Traveler',
    'Sci-Fi Savant',
    'Warp Speed Reader'
  ],
  'Mystery': [
    'Clue Collector',
    'Plot Detective',
    'Mystery Maven',
    'Case Closer'
  ],
  'Romance': [
    'Love Story Lover',
    'Happily Ever After Hunter',
    'Romance Ranger',
    'Heart Bookmarker'
  ],
  'Horror': [
    'Fright Page Turner',
    'Spine Chiller',
    'Horror Hoarder',
    'Nightmare Navigator'
  ],
  'Thriller': [
    'Suspense Seeker',
    'Adrenaline Bookworm',
    'Cliff Hanger',
    'Thrill Chaser'
  ],
  'Historical Fiction': [
    'Time Tome Traveler',
    'History Buff Reader',
    'Past Page Turner',
    'Chronicle Champion'
  ],
  'Biography': [
    'Life Story Lover',
    'Biography Buff',
    'Memoir Maniac',
    'Real Page Turner'
  ],
  'Classic': [
    'Timeless Text Lover',
    'Classic Connoisseur',
    'Literary Legend',
    'Vintage Volume Voyager'
  ],
  'Adventure': [
    'Quest Quester',
    'Journey Journal Keeper',
    'Adventure Addict',
    'Expedition Expert'
  ],
  'Young Adult': [
    'YA Yearner',
    'Coming-of-Age Connoisseur',
    'Teen Tale Tracker',
    'Growth Story Guru'
  ],
  'Dystopian': [
    'Dystopia Dweller',
    'Future Forecaster',
    'Apocalypse Aficionado',
    'Bleak Book Lover'
  ],
  'Poetry': [
    'Rhyme Ranger',
    'Verse Virtuoso',
    'Stanza Savant',
    'Poetry Pilgrim'
  ],
  'Self-Help': [
    'Growth Guru',
    'Self-Improvement Sage',
    'Mindful Bookmarker',
    'Life Lesson Learner'
  ],
  'Cookbook': [
    'Recipe Reader',
    'Culinary Chapter Champion',
    'Book Chef',
    'Page Plate Turner'
  ],
  'Literary Fiction': [
    'Prose Prodigy',
    'Literary Luminary',
    'Metaphor Master',
    'Narrative Navigator'
  ],
  'Graphic Novel': [
    'Panel Peruser',
    'Comic Collector',
    'Graphic Guru',
    'Illustrated Imagination'
  ],
  'Philosophy': [
    'Thought Tome Traveler',
    'Wisdom Wanderer',
    'Philosophical Phenom',
    'Deep Thought Diver'
  ],
  'Comedy': [
    'Laugh Line Lover',
    'Humor Hunter',
    'Chuckle Champion',
    'Wit Wizard'
  ]
};

// Default puns for when no specific genre is found
export const defaultPuns: string[] = [
  'Bookish Buddy',
  'Literary Explorer',
  'Page Prowler',
  'Bookworm Supreme',
  'Story Seeker'
];

// Get a random pun for a specific genre
export function getRandomPun(genre: string): string {
  const genrePunList = genrePuns[genre];
  if (genrePunList && genrePunList.length > 0) {
    const randomIndex = Math.floor(Math.random() * genrePunList.length);
    return genrePunList[randomIndex];
  }
  
  // Fallback to default puns
  const randomIndex = Math.floor(Math.random() * defaultPuns.length);
  return defaultPuns[randomIndex];
}