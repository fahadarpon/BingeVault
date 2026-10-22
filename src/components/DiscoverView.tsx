import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad2, 
  Search, 
  Plus, 
  Check, 
  Star, 
  Loader2, 
  Layers,
  ChevronDown
} from 'lucide-react';
import type { MediaItem, MediaType, MediaStatus } from '../types/media';
import { fetchFullLiveCatalog } from '../utils/apiSearch';
import type { SearchResultItem } from '../utils/apiSearch';
import { getTypeBadgeClass, getTypeDisplayName, fireCelebrationConfetti } from '../utils/helpers';

interface DiscoverViewProps {
  onAddMedia: (item: MediaItem) => void;
  existingItems: MediaItem[];
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onAddMedia,
  existingItems,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'title_asc' | 'year_desc'>('rating_desc');
  
  const [allCatalog, setAllCatalog] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(32);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Duplicate title checking
  const existingTitles = useMemo(() => {
    return new Set(existingItems.map((i) => i.title.toLowerCase().trim()));
  }, [existingItems]);

  // Load all available catalog items from live APIs on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setLoading(true);
      try {
        const fullList = await fetchFullLiveCatalog();
        if (isMounted) {
          setAllCatalog(fullList);
        }
      } catch (err) {
        console.error('Failed to load full live catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: allCatalog.length,
      movie: allCatalog.filter((i) => i.type === 'movie').length,
      series: allCatalog.filter((i) => i.type === 'series').length,
      anime: allCatalog.filter((i) => i.type === 'anime').length,
      game: allCatalog.filter((i) => i.type === 'game').length,
    };
  }, [allCatalog]);

  // Dynamic genres based on selected category
  const availableGenres = useMemo(() => {
    const list = selectedCategory === 'all' 
      ? allCatalog 
      : allCatalog.filter((i) => i.type === selectedCategory);
    
    const set = new Set<string>();
    list.forEach((i) => {
      (i.genres || []).forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [allCatalog, selectedCategory]);

  // Filtered & Sorted items
  const filteredCatalog = useMemo(() => {
    return allCatalog.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.type !== selectedCategory) return false;

      // Genre filter
      if (selectedGenre && (!item.genres || !item.genres.includes(selectedGenre))) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesGenres) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating_desc') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'year_desc') {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }
      return 0;
    });
  }, [allCatalog, selectedCategory, selectedGenre, searchQuery, sortBy]);

  const handleAdd = (item: SearchResultItem, status: MediaStatus = 'plan_to_watch') => {
    const newItem: MediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: item.type,
      title: item.title,
      status,
      rating: item.rating || 0,
      favorite: false,
      posterUrl: item.posterUrl,
      releaseYear: item.releaseYear,
      genres: item.genres || [],
      notes: item.description || '',
      startDate: status === 'in_progress' ? new Date().toISOString().slice(0, 10) : undefined,
      completedDate: status === 'completed' ? new Date().toISOString().slice(0, 10) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(item.type === 'movie' ? { runtimeMinutes: item.runtimeMinutes, rewatchCount: 0, director: item.director } : {}),
      ...(item.type === 'series' ? { currentSeason: 1, currentEpisode: 0, totalEpisodes: item.totalEpisodes || 10, network: item.network } : {}),
      ...(item.type === 'anime' ? { currentEpisode: 0, totalEpisodes: item.totalEpisodes || 24, studio: item.studio } : {}),
      ...(item.type === 'game' ? { hoursPlayed: 0, platform: item.platform || 'PC' } : {}),
    } as MediaItem;

    onAddMedia(newItem);
    setAddedIds((prev) => new Set([...prev, item.id]));
    fireCelebrationConfetti();
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'movie': return <Film className="w-3.5 h-3.5" />;
      case 'series': return <Tv className="w-3.5 h-3.5" />;
      case 'anime': return <Sparkles className="w-3.5 h-3.5" />;
      case 'game': return <Gamepad2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 mb-3">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Full Catalog Live Feed</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Explore All Available Titles
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            Loaded directly from <strong>Kitsu</strong>, <strong>TVMaze</strong>, <strong>FreeToGame</strong>, and <strong>Open Movie Database</strong>. Browse hundreds of titles and add them directly to your personal Vault!
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-purple-300">
            <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-mono">
              {allCatalog.length} Total Titles Loaded
            </span>
            <span className="text-slate-400">• Ready to explore & add</span>
          </div>
        </div>
      </div>

      {/* Category Pills with Total Item Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setSelectedCategory('all'); setVisibleCount(32); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Media</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => { setSelectedCategory('movie'); setVisibleCount(32); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'movie'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-pink-400" />
          <span>Movies</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {counts.movie}
          </span>
        </button>

        <button
          onClick={() => { setSelectedCategory('series'); setVisibleCount(32); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'series'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-violet-400" />
          <span>TV Series</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {counts.series}
          </span>
        </button>

        <button
          onClick={() => { setSelectedCategory('anime'); setVisibleCount(32); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'anime'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Anime</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {counts.anime}
          </span>
        </button>

        <button
          onClick={() => { setSelectedCategory('game'); setVisibleCount(32); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'game'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Video Games</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {counts.game}
          </span>
        </button>
      </div>

      {/* Search, Genre & Sort Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        
        {/* Instant Search in Catalog */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search across ${filteredCatalog.length} titles...`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(32); }}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Genre Filter */}
          {availableGenres.length > 0 && (
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setVisibleCount(32); }}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="rating_desc">Highest Rated (★)</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="year_desc">Newest Year</option>
          </select>
        </div>

      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 text-slate-400">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
          <p className="text-base font-bold text-slate-200">Loading full live catalog from APIs...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting to Kitsu, TVMaze, FreeToGame & Open Cinema</p>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <p className="text-sm text-slate-300 font-bold">No titles match your filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCatalog.slice(0, visibleCount).map((item) => {
              const alreadyInVault = existingTitles.has(item.title.toLowerCase().trim()) || addedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/25"
                >
                  {/* Poster */}
                  <div className="relative aspect-[16/10] sm:aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        {getMediaIcon(item.type)}
                        <span className="text-xs mt-1">No Poster</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

                    {/* Top Type Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border backdrop-blur-md ${getTypeBadgeClass(item.type)}`}>
                        {getMediaIcon(item.type)}
                        {getTypeDisplayName(item.type)}
                      </span>

                      {item.releaseYear && (
                        <span className="text-[11px] font-medium text-slate-200 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-mono">
                          {item.releaseYear}
                        </span>
                      )}
                    </div>

                    {/* Rating Badge */}
                    {item.rating && item.rating > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-100 group-hover:text-purple-300 text-sm line-clamp-1 mb-1" title={item.title}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Genres */}
                    {item.genres && item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                        {item.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      {alreadyInVault ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>In Your Vault</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAdd(item, 'plan_to_watch')}
                            className="flex-1 py-2 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Plan to {item.type === 'game' ? 'Play' : 'Watch'}</span>
                          </button>

                          <button
                            onClick={() => handleAdd(item, 'in_progress')}
                            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                            title={`Add directly as ${item.type === 'game' ? 'Playing' : 'Watching'}`}
                          >
                            {item.type === 'game' ? 'Play' : 'Watch'}
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredCatalog.length && (
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Load More Titles (+24)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Showing {Math.min(visibleCount, filteredCatalog.length)} of {filteredCatalog.length} available titles
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};
