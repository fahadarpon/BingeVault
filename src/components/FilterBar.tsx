import React from 'react';
import { 
  Search, 
  X, 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad2, 
  Star,
  Layers
} from 'lucide-react';
import type { MediaItem, MediaStatus, MediaType, SortOption } from '../types/media';

interface FilterBarProps {
  items: MediaItem[];
  selectedType: MediaType | 'all';
  onSelectType: (type: MediaType | 'all') => void;
  selectedStatus: MediaStatus | 'all';
  onSelectStatus: (status: MediaStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  availableGenres: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSortChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  availableGenres
}) => {
  // Counts
  const counts = {
    all: items.length,
    movie: items.filter(i => i.type === 'movie').length,
    series: items.filter(i => i.type === 'series').length,
    anime: items.filter(i => i.type === 'anime').length,
    game: items.filter(i => i.type === 'game').length,
    favorites: items.filter(i => i.favorite).length,
  };

  const statusCounts = {
    all: selectedType === 'all' ? items.length : items.filter(i => i.type === selectedType).length,
    in_progress: items.filter(i => (selectedType === 'all' || i.type === selectedType) && i.status === 'in_progress').length,
    plan_to_watch: items.filter(i => (selectedType === 'all' || i.type === selectedType) && i.status === 'plan_to_watch').length,
    completed: items.filter(i => (selectedType === 'all' || i.type === selectedType) && i.status === 'completed').length,
    on_hold: items.filter(i => (selectedType === 'all' || i.type === selectedType) && i.status === 'on_hold').length,
    dropped: items.filter(i => (selectedType === 'all' || i.type === selectedType) && i.status === 'dropped').length,
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Primary Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectType('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedType === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/50'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Media</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 font-mono">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => onSelectType('movie')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedType === 'movie'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400/50'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Film className="w-4 h-4 text-pink-400" />
          <span>Movies</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 font-mono">
            {counts.movie}
          </span>
        </button>

        <button
          onClick={() => onSelectType('series')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedType === 'series'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400/50'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Tv className="w-4 h-4 text-violet-400" />
          <span>TV Series</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 font-mono">
            {counts.series}
          </span>
        </button>

        <button
          onClick={() => onSelectType('anime')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedType === 'anime'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400/50'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Anime</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 font-mono">
            {counts.anime}
          </span>
        </button>

        <button
          onClick={() => onSelectType('game')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            selectedType === 'game'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-emerald-400" />
          <span>Games</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/30 font-mono">
            {counts.game}
          </span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Favorites pill */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            favoritesOnly
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-amber-300 border border-slate-800/80'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Favorites</span>
          {counts.favorites > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {counts.favorites}
            </span>
          )}
        </button>
      </div>

      {/* Secondary Bar: Status tabs, Search, Genre & Sort */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-2xl backdrop-blur-md">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Status' },
            { id: 'in_progress', label: selectedType === 'game' ? 'Playing' : 'Watching' },
            { id: 'plan_to_watch', label: 'Plan' },
            { id: 'completed', label: 'Completed' },
            { id: 'on_hold', label: 'On Hold' },
            { id: 'dropped', label: 'Dropped' },
          ].map(st => {
            const count = statusCounts[st.id as keyof typeof statusCounts];
            const isSelected = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStatus(st.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-purple-300 shadow-sm border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-purple-950/60 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, notes, studio..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Genre Filter */}
          {availableGenres.length > 0 && (
            <select
              value={selectedGenre}
              onChange={(e) => onSelectGenre(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Genres</option>
              {availableGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="updated_desc">Recently Updated</option>
            <option value="rating_desc">Highest Rated (★ 10-0)</option>
            <option value="rating_asc">Lowest Rated (★ 0-10)</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="year_desc">Newest Year</option>
            <option value="progress_desc">Highest Progress</option>
          </select>
        </div>

      </div>
    </div>
  );
};
