import type { MediaType } from '../types/media';

export interface SearchResultItem {
  id: string;
  type: MediaType;
  title: string;
  posterUrl: string;
  releaseYear?: number;
  genres: string[];
  description: string;
  rating?: number;
  // Specifics
  totalEpisodes?: number;
  runtimeMinutes?: number;
  director?: string;
  studio?: string;
  network?: string;
  platform?: string;
}

export async function searchOnlineMedia(query: string, type: MediaType): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];
  const cleanQuery = query.trim();

  try {
    if (type === 'anime') {
      return await searchAnime(cleanQuery);
    } else if (type === 'series') {
      return await searchSeries(cleanQuery);
    } else if (type === 'movie') {
      return await searchMovies(cleanQuery);
    } else {
      return await searchGames(cleanQuery);
    }
  } catch (err) {
    console.error('Online search error:', err);
    return [];
  }
}

// 1. ANIME: Kitsu Open API
async function searchAnime(query: string): Promise<SearchResultItem[]> {
  const url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=6`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  
  if (!data.data || !Array.isArray(data.data)) return [];

  return data.data.map((item: any) => {
    const attr = item.attributes || {};
    const title = attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || query;
    const posterUrl = attr.posterImage?.large || attr.posterImage?.medium || '';
    const releaseYear = attr.startDate ? parseInt(attr.startDate.slice(0, 4), 10) : undefined;
    const totalEpisodes = attr.episodeCount || undefined;
    const rating = attr.averageRating ? parseFloat((parseFloat(attr.averageRating) / 10).toFixed(1)) : undefined;

    return {
      id: `anime_${item.id}`,
      type: 'anime',
      title,
      posterUrl,
      releaseYear,
      genres: ['Anime', 'Animation'],
      description: attr.synopsis ? attr.synopsis.slice(0, 300) : '',
      rating,
      totalEpisodes,
    };
  });
}

// 2. TV SERIES: TVMaze Open API
async function searchSeries(query: string): Promise<SearchResultItem[]> {
  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  if (!Array.isArray(data)) return [];

  return data.slice(0, 6).map((item: any) => {
    const show = item.show || {};
    const title = show.name || query;
    const posterUrl = show.image?.original || show.image?.medium || '';
    const releaseYear = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : undefined;
    const network = show.network?.name || show.webChannel?.name || undefined;
    const rating = show.rating?.average ? show.rating.average : undefined;
    
    const cleanSummary = show.summary 
      ? show.summary.replace(/<[^>]*>?/gm, '').slice(0, 300) 
      : '';

    return {
      id: `series_${show.id}`,
      type: 'series',
      title,
      posterUrl,
      releaseYear,
      genres: show.genres || ['Drama'],
      description: cleanSummary,
      rating,
      network,
    };
  });
}

// 3. MOVIES: Wikipedia Search & Summary
async function searchMovies(query: string): Promise<SearchResultItem[]> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query + ' film')}&limit=4&namespace=0&format=json&origin=*`;
  const res = await fetch(searchUrl);
  if (!res.ok) return [];
  const [, titles] = await res.json();

  if (!titles || titles.length === 0) {
    const fallbackRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json&origin=*`);
    const [, fallbackTitles] = await fallbackRes.json();
    return fetchWikipediaPages(fallbackTitles || [], 'movie');
  }

  return fetchWikipediaPages(titles, 'movie');
}

// 4. GAMES: Wikipedia Search & Summary
async function searchGames(query: string): Promise<SearchResultItem[]> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query + ' video game')}&limit=4&namespace=0&format=json&origin=*`;
  const res = await fetch(searchUrl);
  if (!res.ok) return [];
  const [, titles] = await res.json();

  if (!titles || titles.length === 0) {
    const fallbackRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json&origin=*`);
    const [, fallbackTitles] = await fallbackRes.json();
    return fetchWikipediaPages(fallbackTitles || [], 'game');
  }

  return fetchWikipediaPages(titles, 'game');
}

async function fetchWikipediaPages(titles: string[], type: MediaType): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];

  for (const rawTitle of titles.slice(0, 5)) {
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(rawTitle)}`;
      const res = await fetch(summaryUrl);
      if (!res.ok) continue;
      const data = await res.json();

      const cleanTitle = data.title.replace(/\s\((film|video game|franchise|series)\)/gi, '');
      const posterUrl = data.thumbnail?.source || '';
      
      let releaseYear: number | undefined;
      const yearMatch = (data.description || data.extract || '').match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        releaseYear = parseInt(yearMatch[0], 10);
      }

      results.push({
        id: `wiki_${data.pageid || Math.random()}`,
        type,
        title: cleanTitle,
        posterUrl,
        releaseYear,
        genres: type === 'game' ? ['Video Game', 'Action'] : ['Movie', 'Cinema'],
        description: data.extract ? data.extract.slice(0, 300) : '',
        platform: type === 'game' ? 'PC' : undefined,
      });
    } catch {
      // Continue next title
    }
  }

  return results;
}

// --- DISCOVER / POPULAR TITLES FETCHER ---
export async function fetchDiscoverMedia(type: MediaType | 'all'): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];

  // Fetch Trending Anime from Kitsu API
  if (type === 'all' || type === 'anime') {
    try {
      const res = await fetch('https://kitsu.io/api/edge/trending/anime?limit=8');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            const attr = item.attributes || {};
            results.push({
              id: `disc_anime_${item.id}`,
              type: 'anime',
              title: attr.canonicalTitle || attr.titles?.en || 'Anime Title',
              posterUrl: attr.posterImage?.large || attr.posterImage?.medium || '',
              releaseYear: attr.startDate ? parseInt(attr.startDate.slice(0, 4), 10) : 2023,
              genres: ['Anime', 'Animation', 'Action'],
              description: attr.synopsis ? attr.synopsis.slice(0, 240) + '...' : '',
              rating: attr.averageRating ? parseFloat((parseFloat(attr.averageRating) / 10).toFixed(1)) : 8.8,
              totalEpisodes: attr.episodeCount || 24,
            });
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch trending anime:', e);
    }
  }

  // Fetch Trending TV Series from TVMaze API
  if (type === 'all' || type === 'series') {
    try {
      const popularQuery = ['Severance', 'Arcane', 'The Last of Us', 'Stranger Things', 'Fallout', 'House of the Dragon', 'Shogun', 'Breaking Bad'];
      for (const title of popularQuery.slice(0, 6)) {
        const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`);
        if (res.ok) {
          const show = await res.json();
          results.push({
            id: `disc_series_${show.id}`,
            type: 'series',
            title: show.name,
            posterUrl: show.image?.original || show.image?.medium || '',
            releaseYear: show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : 2023,
            genres: show.genres || ['Drama'],
            description: show.summary ? show.summary.replace(/<[^>]*>?/gm, '').slice(0, 240) + '...' : '',
            rating: show.rating?.average || 9.0,
            network: show.network?.name || show.webChannel?.name || 'Streaming',
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch trending series:', e);
    }
  }

  // Fetch Top Movies from Wikipedia REST API
  if (type === 'all' || type === 'movie') {
    const popularMovies = [
      'Dune: Part Two',
      'Spider-Man: Across the Spider-Verse',
      'Oppenheimer (film)',
      'Interstellar (film)',
      'Inception',
      'Everything Everywhere All at Once'
    ];
    for (const title of popularMovies) {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (res.ok) {
          const data = await res.json();
          const cleanTitle = data.title.replace(/\s\((film|video game|franchise|series)\)/gi, '');
          results.push({
            id: `disc_movie_${data.pageid || Math.random()}`,
            type: 'movie',
            title: cleanTitle,
            posterUrl: data.thumbnail?.source || '',
            releaseYear: 2023,
            genres: ['Sci-Fi', 'Cinema', 'Action'],
            description: data.extract ? data.extract.slice(0, 240) + '...' : '',
            rating: 9.2,
          });
        }
      } catch {
        // continue
      }
    }
  }

  // Fetch Hit Video Games from Wikipedia REST API
  if (type === 'all' || type === 'game') {
    const popularGames = [
      'Elden Ring',
      'Black Myth: Wukong',
      'Baldur\'s Gate 3',
      'Cyberpunk 2077',
      'The Legend of Zelda: Tears of the Kingdom',
      'Hollow Knight'
    ];
    for (const title of popularGames) {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (res.ok) {
          const data = await res.json();
          results.push({
            id: `disc_game_${data.pageid || Math.random()}`,
            type: 'game',
            title: data.title,
            posterUrl: data.thumbnail?.source || '',
            releaseYear: 2024,
            genres: ['Action RPG', 'Adventure', 'Open World'],
            description: data.extract ? data.extract.slice(0, 240) + '...' : '',
            rating: 9.5,
            platform: 'PC / Console',
          });
        }
      } catch {
        // continue
      }
    }
  }

  return results;
}
