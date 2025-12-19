const API_KEY = import.meta.env.VITE_GOOGLE_CSE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;
const BASE_URL = 'https://www.googleapis.com/customsearch/v1';

/**
 * Search for movie/TV posters using Google Image Search
 */
export const searchMediaPosters = async (query, count = 10) => {
  try {
    const response = await fetch(
      `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query + ' poster')}&searchType=image&num=${count}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posters');
    }

    const data = await response.json();
    
    return data.items?.map(item => ({
      url: item.link,
      thumbnail: item.image.thumbnailLink,
      title: item.title,
      source: item.displayLink
    })) || [];
  } catch (error) {
    console.error('Error fetching posters:', error);
    return [];
  }
};

/**
 * Search for movie/TV metadata (description, ratings, reviews)
 */
export const searchMediaMetadata = async (title, year = '') => {
  try {
    const query = year ? `${title} ${year} movie` : `${title} movie`;
    
    const response = await fetch(
      `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();
    
    // Parse snippets for metadata
    const results = data.items || [];
    
    return {
      description: extractDescription(results),
      rating: extractRating(results),
      year: extractYear(results),
      genre: extractGenre(results),
      cast: extractCast(results),
      director: extractDirector(results)
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

/**
 * Search for trending movies
 */
export const searchTrendingMovies = async () => {
  try {
    const queries = [
      'trending movies 2025 poster',
      'popular movies poster',
      'new movies poster'
    ];

    const results = await Promise.all(
      queries.map(q => searchMediaPosters(q, 5))
    );

    // Flatten and deduplicate
    const allPosters = results.flat();
    const uniquePosters = Array.from(
      new Map(allPosters.map(item => [item.url, item])).values()
    );

    return uniquePosters.slice(0, 20);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

/**
 * Search for trending TV shows
 */
export const searchTrendingTVShows = async () => {
  try {
    const queries = [
      'trending TV shows 2025 poster',
      'popular TV series poster',
      'new TV shows poster'
    ];

    const results = await Promise.all(
      queries.map(q => searchMediaPosters(q, 5))
    );

    const allPosters = results.flat();
    const uniquePosters = Array.from(
      new Map(allPosters.map(item => [item.url, item])).values()
    );

    return uniquePosters.slice(0, 20);
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return [];
  }
};

/**
 * Search for specific movie/show details
 */
export const searchMediaDetails = async (title, type = 'movie') => {
  try {
    const [posters, metadata] = await Promise.all([
      searchMediaPosters(`${title} ${type} poster`, 5),
      searchMediaMetadata(title)
    ]);

    return {
      title,
      type,
      poster: posters[0]?.url || null,
      posters: posters,
      ...metadata
    };
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
};

/**
 * Search for cast information
 */
export const searchCastInfo = async (title) => {
  try {
    const response = await fetch(
      `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(title + ' cast actors')}&num=3`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cast info');
    }

    const data = await response.json();
    return extractCast(data.items || []);
  } catch (error) {
    console.error('Error fetching cast:', error);
    return [];
  }
};

/**
 * Search for reviews
 */
export const searchReviews = async (title) => {
  try {
    const response = await fetch(
      `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(title + ' movie review')}&num=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    
    return data.items?.map(item => ({
      source: item.displayLink,
      snippet: item.snippet,
      link: item.link,
      title: item.title
    })) || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// ========== HELPER FUNCTIONS ==========

function extractDescription(results) {
  for (const item of results) {
    if (item.snippet && item.snippet.length > 50) {
      return item.snippet;
    }
  }
  return 'No description available';
}

function extractRating(results) {
  for (const item of results) {
    const text = item.snippet || item.title || '';
    // Look for patterns like "8.5/10" or "IMDb: 7.8"
    const ratingMatch = text.match(/(\d+\.?\d*)\/10|IMDb[:\s]+(\d+\.?\d*)/i);
    if (ratingMatch) {
      return ratingMatch[1] || ratingMatch[2];
    }
  }
  return null;
}

function extractYear(results) {
  for (const item of results) {
    const text = item.snippet || item.title || '';
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return yearMatch[0];
    }
  }
  return null;
}

function extractGenre(results) {
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Romance', 'Sci-Fi', 'Fantasy', 'Animation', 'Documentary'];
  
  for (const item of results) {
    const text = item.snippet || item.title || '';
    for (const genre of genres) {
      if (text.toLowerCase().includes(genre.toLowerCase())) {
        return genre;
      }
    }
  }
  return 'Unknown';
}

function extractCast(results) {
  const cast = [];
  
  for (const item of results) {
    const text = item.snippet || '';
    // Look for patterns like "starring John Doe" or "actors: Jane Smith"
    const castMatch = text.match(/(?:starring|actors?|cast)[:\s]+([^.]+)/i);
    if (castMatch) {
      const actors = castMatch[1].split(/,|and/).map(a => a.trim()).slice(0, 5);
      cast.push(...actors);
    }
  }
  
  return [...new Set(cast)].slice(0, 10);
}

function extractDirector(results) {
  for (const item of results) {
    const text = item.snippet || '';
    const directorMatch = text.match(/(?:directed by|director)[:\s]+([^.,]+)/i);
    if (directorMatch) {
      return directorMatch[1].trim();
    }
  }
  return null;
}
