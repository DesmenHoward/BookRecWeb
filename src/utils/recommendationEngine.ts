import { Book } from '../types/book';

export interface UserProfile {
  genrePreferences: Record<string, number>;
  authorPreferences: Record<string, number>;
  yearPreferences: Record<string, number>;
  lengthPreferences: Record<string, number>;
  likedBooks: Book[];
  dislikedBooks: Book[];
  interactionHistory: BookInteraction[];
}

export interface BookInteraction {
  bookId: string;
  action: 'like' | 'dislike' | 'favorite' | 'read' | 'skip';
  timestamp: number;
  book: Book;
}

export interface BookScore {
  book: Book;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  private static readonly GENRE_WEIGHT = 0.3;
  private static readonly AUTHOR_WEIGHT = 0.2;
  private static readonly YEAR_WEIGHT = 0.15;
  private static readonly LENGTH_WEIGHT = 0.1;
  private static readonly SIMILARITY_WEIGHT = 0.25;
  
  private static readonly RECENCY_DECAY = 0.95; // How much recent interactions matter more
  private static readonly MIN_INTERACTIONS = 3; // Minimum interactions before personalization kicks in

  /**
   * Build a user profile from their interaction history
   */
  static buildUserProfile(interactions: BookInteraction[]): UserProfile {
    const profile: UserProfile = {
      genrePreferences: {},
      authorPreferences: {},
      yearPreferences: {},
      lengthPreferences: {},
      likedBooks: [],
      dislikedBooks: [],
      interactionHistory: interactions
    };

    // Sort interactions by timestamp (most recent first)
    const sortedInteractions = [...interactions].sort((a, b) => b.timestamp - a.timestamp);

    sortedInteractions.forEach((interaction, index) => {
      const recencyWeight = Math.pow(this.RECENCY_DECAY, index);
      const actionWeight = this.getActionWeight(interaction.action);
      const finalWeight = recencyWeight * actionWeight;

      const book = interaction.book;

      // Update genre preferences
      book.genres?.forEach(genre => {
        profile.genrePreferences[genre] = (profile.genrePreferences[genre] || 0) + finalWeight;
      });

      // Update author preferences
      if (book.author) {
        profile.authorPreferences[book.author] = (profile.authorPreferences[book.author] || 0) + finalWeight;
      }

      // Update year preferences (group by decades)
      if (book.publishedYear) {
        const decade = Math.floor(book.publishedYear / 10) * 10;
        const decadeKey = `${decade}s`;
        profile.yearPreferences[decadeKey] = (profile.yearPreferences[decadeKey] || 0) + finalWeight;
      }

      // Update length preferences based on description length as proxy
      if (book.description) {
        const lengthCategory = this.getDescriptionLengthCategory(book.description.length);
        profile.lengthPreferences[lengthCategory] = (profile.lengthPreferences[lengthCategory] || 0) + finalWeight;
      }

      // Categorize books
      if (actionWeight > 0) {
        profile.likedBooks.push(book);
      } else if (actionWeight < 0) {
        profile.dislikedBooks.push(book);
      }
    });

    return profile;
  }

  /**
   * Get weight for different user actions
   */
  private static getActionWeight(action: string): number {
    switch (action) {
      case 'favorite': return 2.0;
      case 'like': return 1.0;
      case 'read': return 1.5;
      case 'dislike': return -1.0;
      case 'skip': return -0.3;
      default: return 0;
    }
  }

  /**
   * Categorize description length as proxy for book length
   */
  private static getDescriptionLengthCategory(descLength: number): string {
    if (descLength < 300) return 'short';
    if (descLength < 600) return 'medium';
    if (descLength < 1000) return 'long';
    return 'very-long';
  }

  /**
   * Score a book based on user profile
   */
  static scoreBook(book: Book, userProfile: UserProfile): BookScore {
    const reasons: string[] = [];
    let totalScore = 0;

    // Skip books the user has already interacted with
    const hasInteracted = userProfile.interactionHistory.some(
      interaction => interaction.bookId === book.id
    );
    
    if (hasInteracted) {
      return { book, score: -1, reasons: ['Already seen'] };
    }

    // Genre scoring
    let genreScore = 0;
    book.genres?.forEach(genre => {
      const preference = userProfile.genrePreferences[genre] || 0;
      genreScore += preference;
      if (preference > 0.5) {
        reasons.push(`You like ${genre} books`);
      }
    });
    totalScore += genreScore * this.GENRE_WEIGHT;

    // Author scoring
    let authorScore = 0;
    if (book.author && userProfile.authorPreferences[book.author]) {
      authorScore = userProfile.authorPreferences[book.author];
      reasons.push(`You've liked books by ${book.author}`);
    }
    totalScore += authorScore * this.AUTHOR_WEIGHT;

    // Year/decade scoring
    let yearScore = 0;
    if (book.publishedYear) {
      const decade = Math.floor(book.publishedYear / 10) * 10;
      const decadeKey = `${decade}s`;
      yearScore = userProfile.yearPreferences[decadeKey] || 0;
      if (yearScore > 0.5) {
        reasons.push(`You enjoy books from the ${decadeKey}`);
      }
    }
    totalScore += yearScore * this.YEAR_WEIGHT;

    // Length scoring
    let lengthScore = 0;
    if (book.description) {
      const lengthCategory = this.getDescriptionLengthCategory(book.description.length);
      lengthScore = userProfile.lengthPreferences[lengthCategory] || 0;
      if (lengthScore > 0.5) {
        reasons.push(`You prefer ${lengthCategory} books`);
      }
    }
    totalScore += lengthScore * this.LENGTH_WEIGHT;

    // Similarity scoring (compare to liked books)
    let similarityScore = 0;
    if (userProfile.likedBooks.length > 0) {
      const similarities = userProfile.likedBooks.map(likedBook => 
        this.calculateBookSimilarity(book, likedBook)
      );
      similarityScore = Math.max(...similarities);
      if (similarityScore > 0.3) {
        reasons.push('Similar to books you\'ve liked');
      }
    }
    totalScore += similarityScore * this.SIMILARITY_WEIGHT;

    // Penalize books similar to disliked ones
    if (userProfile.dislikedBooks.length > 0) {
      const dislikeSimilarities = userProfile.dislikedBooks.map(dislikedBook => 
        this.calculateBookSimilarity(book, dislikedBook)
      );
      const maxDislikeSimilarity = Math.max(...dislikeSimilarities);
      if (maxDislikeSimilarity > 0.4) {
        totalScore -= maxDislikeSimilarity * 0.5;
        reasons.push('Different from books you disliked');
      }
    }

    return {
      book,
      score: Math.max(0, totalScore), // Ensure non-negative scores
      reasons
    };
  }

  /**
   * Calculate similarity between two books
   */
  private static calculateBookSimilarity(book1: Book, book2: Book): number {
    let similarity = 0;
    let factors = 0;

    // Genre similarity
    if (book1.genres && book2.genres) {
      const genres1 = new Set(book1.genres);
      const genres2 = new Set(book2.genres);
      const intersection = new Set([...genres1].filter(x => genres2.has(x)));
      const union = new Set([...genres1, ...genres2]);
      similarity += intersection.size / union.size;
      factors++;
    }

    // Author similarity
    if (book1.author === book2.author && book1.author) {
      similarity += 1;
      factors++;
    }

    // Year similarity (within 10 years)
    if (book1.publishedYear && book2.publishedYear) {
      const yearDiff = Math.abs(book1.publishedYear - book2.publishedYear);
      similarity += Math.max(0, 1 - yearDiff / 20); // Similarity decreases over 20 years
      factors++;
    }

    // Description length similarity as proxy for book length
    if (book1.description && book2.description) {
      const lengthDiff = Math.abs(book1.description.length - book2.description.length);
      similarity += Math.max(0, 1 - lengthDiff / 1000); // Similarity decreases over 1000 chars
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Get personalized book recommendations
   */
  static getPersonalizedRecommendations(
    availableBooks: Book[], 
    userProfile: UserProfile, 
    limit: number = 20
  ): BookScore[] {
    // If user has insufficient interactions, return random selection
    if (userProfile.interactionHistory.length < this.MIN_INTERACTIONS) {
      return availableBooks
        .slice(0, limit)
        .map(book => ({ book, score: Math.random(), reasons: ['Exploring new content'] }));
    }

    // Score all available books
    const scoredBooks = availableBooks
      .map(book => this.scoreBook(book, userProfile))
      .filter(scored => scored.score >= 0); // Remove books with negative scores

    // Sort by score (highest first) and return top results
    return scoredBooks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Convert swipe data to interaction format
   */
  static convertSwipesToInteractions(
    swipedBooks: { bookId: string; liked: boolean; timestamp: number }[],
    allBooks: Book[]
  ): BookInteraction[] {
    const bookMap = new Map(allBooks.map(book => [book.id, book]));
    
    const interactions: BookInteraction[] = [];
    
    for (const swipe of swipedBooks) {
      const book = bookMap.get(swipe.bookId);
      if (book) {
        interactions.push({
          bookId: swipe.bookId,
          action: swipe.liked ? 'like' : 'dislike',
          timestamp: swipe.timestamp,
          book
        });
      }
    }
    
    return interactions;
  }

  /**
   * Update user profile with new interaction
   */
  static updateProfileWithInteraction(
    profile: UserProfile, 
    interaction: BookInteraction
  ): UserProfile {
    const updatedInteractions = [...profile.interactionHistory, interaction];
    return this.buildUserProfile(updatedInteractions);
  }
}
