const TMDB_BASE_URL = '/api/tmdb';

// Update these for high-quality images
// These usually work even if the API domain is blocked, as they are on a different CDN
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500'; 
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original'; 

/**
 * Fetch trending movies
 */
export const fetchTrendingMovies = async (timeWindow = 'week', page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending movies');
    }

    const data = await response.json();
    
    return data.results.map(movie => ({
      tmdbId: movie.id.toString(),
      title: movie.title,
      url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      mediaId: movie.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

/**
 * Fetch trending TV shows
 */
export const fetchTrendingTVShows = async (timeWindow = 'week', page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/${timeWindow}?page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending TV shows');
    }

    const data = await response.json();
    
    return data.results.map(show => ({
      tmdbId: show.id.toString(),
      title: show.name,
      url: show.poster_path ? `${POSTER_BASE_URL}${show.poster_path}` : null,
      backdrop: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      rating: show.vote_average.toFixed(1),
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      overview: show.overview,
      mediaId: show.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return [];
  }
};

/**
 * Fetch popular movies
 */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }

    const data = await response.json();
    
    return data.results.map(movie => ({
      tmdbId: movie.id.toString(),
      title: movie.title,
      url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      mediaId: movie.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

/**
 * Fetch popular TV shows
 */
export const fetchPopularTVShows = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch popular TV shows');
    }

    const data = await response.json();
    
    return data.results.map(show => ({
      tmdbId: show.id.toString(),
      title: show.name,
      url: show.poster_path ? `${POSTER_BASE_URL}${show.poster_path}` : null,
      backdrop: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      rating: show.vote_average.toFixed(1),
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      overview: show.overview,
      mediaId: show.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

/**
 * Fetch now playing movies
 */
export const fetchNowPlayingMovies = async () => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch now playing movies');
    }

    const data = await response.json();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const releasedMovies = data.results.filter(movie => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate <= today;
    });
    
    return releasedMovies.map(movie => ({
      tmdbId: movie.id.toString(),
      title: movie.title,
      url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      mediaId: movie.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

/**
 * Fetch top rated movies
 */
export const fetchTopRatedMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top rated movies');
    }

    const data = await response.json();
    
    return data.results.map(movie => ({
      tmdbId: movie.id.toString(),
      title: movie.title,
      url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      mediaId: movie.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

/**
 * Fetch top rated TV shows
 */
export const fetchTopRatedTVShows = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/top_rated?language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top rated TV shows');
    }

    const data = await response.json();
    
    return data.results.map(show => ({
      tmdbId: show.id.toString(),
      title: show.name,
      url: show.poster_path ? `${POSTER_BASE_URL}${show.poster_path}` : null,
      backdrop: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      rating: show.vote_average.toFixed(1),
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      overview: show.overview,
      mediaId: show.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    return [];
  }
};

/**
 * Fetch upcoming movies
 */
export const fetchUpcomingMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming movies');
    }

    const data = await response.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return data.results
      .filter(movie => {
        if (!movie.release_date) return false;
        const releaseDate = new Date(movie.release_date);
        return releaseDate > today;
      })
      .map(movie => ({
        tmdbId: movie.id.toString(),
        title: movie.title,
        url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
        rating: movie.vote_average.toFixed(1),
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        overview: movie.overview,
        mediaId: movie.id.toString()
      }));
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

/**
 * Fetch movie details by ID
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits,videos`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }

    const movie = await response.json();
    const directorData = movie.credits?.crew?.find(person => person.job === 'Director');
    
    return {
      tmdbId: movie.id.toString(),
      title: movie.title,
      url: movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
      rating: movie.vote_average.toFixed(1),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      runtime: movie.runtime,
      genres: movie.genres,
      cast: movie.credits?.cast?.slice(0, 12).map(actor => ({
        name: actor.name,
        profile_path: actor.profile_path
      })) || [],
      director: directorData ? {
        name: directorData.name,
        profile_path: directorData.profile_path
      } : null,
      trailer: movie.videos?.results?.find(video => video.type === 'Trailer')?.key || null
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

/**
 * Fetch TV show details by ID
 */
export const fetchTVShowDetails = async (showId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}?language=en-US&append_to_response=credits,videos`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TV show details');
    }

    const show = await response.json();
    const creatorData = show.created_by?.[0];
    
    return {
      tmdbId: show.id.toString(),
      title: show.name,
      url: show.poster_path ? `${POSTER_BASE_URL}${show.poster_path}` : null,
      backdrop: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      rating: show.vote_average.toFixed(1),
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      overview: show.overview,
      seasons: show.number_of_seasons,
      episodes: show.number_of_episodes,
      genres: show.genres,
      cast: show.credits?.cast?.slice(0, 12).map(actor => ({
        name: actor.name,
        profile_path: actor.profile_path
      })) || [],
      creator: creatorData ? {
        name: creatorData.name,
        profile_path: creatorData.profile_path
      } : null,
      trailer: show.videos?.results?.find(video => video.type === 'Trailer')?.key || null
    };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return null;
  }
};

/**
 * Search movies and TV shows
 */
export const searchMulti = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?language=en-US&query=${encodeURIComponent(query)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to search');
    }

    const data = await response.json();
    
    const formattedResults = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => ({
        tmdbId: item.id.toString(),
        title: item.media_type === 'movie' ? item.title : item.name,
        url: item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : null,
        rating: item.vote_average?.toFixed(1) || 'N/A',
        year: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date).getFullYear() : 'N/A',
        type: item.media_type,
        mediaId: item.id.toString(),
        overview: item.overview
      }));

    return {
      results: formattedResults,
      page: data.page,
      totalPages: data.total_pages
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { results: [], page: 1, totalPages: 1 };
  }
};
