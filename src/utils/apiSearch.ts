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
    
    // Strip HTML from summary
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
  // First search TVMaze (which contains many films and specials) or Wikipedia
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query + ' film')}&limit=4&namespace=0&format=json&origin=*`;
  const res = await fetch(searchUrl);
  if (!res.ok) return [];
  const [, titles] = await res.json();

  if (!titles || titles.length === 0) {
    // Fallback search without "film" suffix
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

      // Clean title from " (film)" or " (video game)"
      const cleanTitle = data.title.replace(/\s\((film|video game|franchise|series)\)/gi, '');
      const posterUrl = data.thumbnail?.source || '';
      
      // Try extracting year from description or extract
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
