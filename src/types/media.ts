export type MediaType = 'movie' | 'series' | 'anime' | 'game';

export type MediaStatus = 'plan_to_watch' | 'in_progress' | 'completed' | 'on_hold' | 'dropped';

export interface BaseMediaItem {
  id: string;
  type: MediaType;
  title: string;
  status: MediaStatus;
  rating: number; // 0 to 10 (0 = unrated)
  favorite: boolean;
  posterUrl: string;
  releaseYear?: number;
  genres: string[];
  notes: string;
  startDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieItem extends BaseMediaItem {
  type: 'movie';
  runtimeMinutes?: number;
  rewatchCount: number;
  director?: string;
}

export interface SeriesItem extends BaseMediaItem {
  type: 'series';
  currentSeason: number;
  totalSeasons?: number;
  currentEpisode: number;
  totalEpisodes?: number;
  network?: string; // Netflix, HBO, Disney+, etc.
}

export interface AnimeItem extends BaseMediaItem {
  type: 'anime';
  currentEpisode: number;
  totalEpisodes?: number;
  seasonNumber?: number;
  studio?: string;
  sourceType?: 'Manga' | 'Light Novel' | 'Original' | 'Visual Novel';
}

export interface GameItem extends BaseMediaItem {
  type: 'game';
  hoursPlayed: number;
  platform: string; // PC, PlayStation, Switch, Xbox, Steam Deck, Mobile
  completionPercentage?: number;
  playStyle?: 'Main Story' | 'Completionist (100%)' | 'Casual / Endless' | 'Multiplayer';
}

export type MediaItem = MovieItem | SeriesItem | AnimeItem | GameItem;

export type ViewMode = 'grid' | 'list' | 'kanban' | 'discover';

export type SortOption = 
  | 'updated_desc' 
  | 'rating_desc' 
  | 'rating_asc' 
  | 'title_asc' 
  | 'year_desc' 
  | 'progress_desc';
