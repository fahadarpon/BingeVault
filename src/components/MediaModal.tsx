import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad2, 
  Check,
  Search,
  Loader2,
  Download
} from 'lucide-react';
import type { MediaItem, MediaStatus, MediaType, MovieItem, SeriesItem, AnimeItem, GameItem } from '../types/media';
import { GENRE_PRESETS, PLATFORM_PRESETS, SAMPLE_POSTERS } from '../data/sampleData';
import { searchOnlineMedia } from '../utils/apiSearch';
import type { SearchResultItem } from '../utils/apiSearch';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MediaItem) => void;
  editingItem?: MediaItem | null;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [type, setType] = useState<MediaType>('movie');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MediaStatus>('in_progress');
  const [rating, setRating] = useState<number>(8);
  const [favorite, setFavorite] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | ''>(new Date().getFullYear());
  const [genres, setGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');

  // Online Auto-Fill State
  const [onlineQuery, setOnlineQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Movie fields
  const [runtimeMinutes, setRuntimeMinutes] = useState<number | ''>('');
  const [rewatchCount, setRewatchCount] = useState<number>(0);
  const [director, setDirector] = useState('');

  // Series fields
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [totalSeasons, setTotalSeasons] = useState<number | ''>('');
  const [seriesEpisode, setSeriesEpisode] = useState<number>(1);
  const [seriesTotalEpisodes, setSeriesTotalEpisodes] = useState<number | ''>('');
  const [network, setNetwork] = useState('');

  // Anime fields
  const [animeEpisode, setAnimeEpisode] = useState<number>(1);
  const [animeTotalEpisodes, setAnimeTotalEpisodes] = useState<number | ''>(12);
  const [animeSeason, setAnimeSeason] = useState<number>(1);
  const [studio, setStudio] = useState('');
  const [sourceType, setSourceType] = useState<'Manga' | 'Light Novel' | 'Original' | 'Visual Novel'>('Manga');

  // Game fields
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [platform, setPlatform] = useState('PC');
  const [completionPercentage, setCompletionPercentage] = useState<number | ''>('');
  const [playStyle, setPlayStyle] = useState<'Main Story' | 'Completionist (100%)' | 'Casual / Endless' | 'Multiplayer'>('Main Story');

  // Reset or Populate form
  useEffect(() => {
    setOnlineQuery('');
    setSearchResults([]);
    setSearchFeedback(null);

    if (editingItem) {
      setType(editingItem.type);
      setTitle(editingItem.title);
      setStatus(editingItem.status);
      setRating(editingItem.rating);
      setFavorite(editingItem.favorite);
      setPosterUrl(editingItem.posterUrl);
      setReleaseYear(editingItem.releaseYear ?? '');
      setGenres(editingItem.genres || []);
      setNotes(editingItem.notes || '');
      setStartDate(editingItem.startDate || '');
      setCompletedDate(editingItem.completedDate || '');

      if (editingItem.type === 'movie') {
        setRuntimeMinutes(editingItem.runtimeMinutes ?? '');
        setRewatchCount(editingItem.rewatchCount || 0);
        setDirector(editingItem.director || '');
      } else if (editingItem.type === 'series') {
        setCurrentSeason(editingItem.currentSeason || 1);
        setTotalSeasons(editingItem.totalSeasons ?? '');
        setSeriesEpisode(editingItem.currentEpisode || 1);
        setSeriesTotalEpisodes(editingItem.totalEpisodes ?? '');
        setNetwork(editingItem.network || '');
      } else if (editingItem.type === 'anime') {
        setAnimeEpisode(editingItem.currentEpisode || 1);
        setAnimeTotalEpisodes(editingItem.totalEpisodes ?? '');
        setAnimeSeason(editingItem.seasonNumber || 1);
        setStudio(editingItem.studio || '');
        setSourceType(editingItem.sourceType || 'Manga');
      } else if (editingItem.type === 'game') {
        setHoursPlayed(editingItem.hoursPlayed || 0);
        setPlatform(editingItem.platform || 'PC');
        setCompletionPercentage(editingItem.completionPercentage ?? '');
        setPlayStyle(editingItem.playStyle || 'Main Story');
      }
    } else {
      setType('movie');
      setTitle('');
      setStatus('in_progress');
      setRating(8);
      setFavorite(false);
      setPosterUrl('');
      setReleaseYear(new Date().getFullYear());
      setGenres(['Action']);
      setNotes('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setCompletedDate('');

      setRuntimeMinutes(120);
      setRewatchCount(0);
      setDirector('');

      setCurrentSeason(1);
      setTotalSeasons(1);
      setSeriesEpisode(1);
      setSeriesTotalEpisodes(10);
      setNetwork('');

      setAnimeEpisode(1);
      setAnimeTotalEpisodes(12);
      setAnimeSeason(1);
      setStudio('');
      setSourceType('Manga');

      setHoursPlayed(0);
      setPlatform('PC');
      setCompletionPercentage(0);
      setPlayStyle('Main Story');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleOnlineSearch = async () => {
    if (!onlineQuery.trim()) return;
    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const results = await searchOnlineMedia(onlineQuery, type);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchFeedback('No matching titles found online. You can still type details manually below.');
      }
    } catch {
      setSearchFeedback('Search request failed. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplySearchResult = (item: SearchResultItem) => {
    setTitle(item.title);
    if (item.posterUrl) setPosterUrl(item.posterUrl);
    if (item.releaseYear) setReleaseYear(item.releaseYear);
    if (item.genres && item.genres.length > 0) setGenres(item.genres);
    if (item.description) setNotes(item.description);

    if (type === 'anime' && item.totalEpisodes) {
      setAnimeTotalEpisodes(item.totalEpisodes);
    }
    if (type === 'series') {
      if (item.network) setNetwork(item.network);
    }
    if (type === 'game') {
      if (item.platform) setPlatform(item.platform);
    }

    setSearchResults([]);
    setSearchFeedback(`Auto-filled: "${item.title}"`);
  };

  const handleToggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const handleAddCustomGenre = () => {
    if (customGenre.trim() && !genres.includes(customGenre.trim())) {
      setGenres([...genres, customGenre.trim()]);
      setCustomGenre('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseData = {
      id: editingItem ? editingItem.id : `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      status,
      rating: Number(rating) || 0,
      favorite,
      posterUrl: posterUrl.trim(),
      releaseYear: releaseYear === '' ? undefined : Number(releaseYear),
      genres,
      notes: notes.trim(),
      startDate: startDate || undefined,
      completedDate: status === 'completed' && !completedDate ? new Date().toISOString().slice(0, 10) : completedDate || undefined,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let fullItem: MediaItem;

    if (type === 'movie') {
      fullItem = {
        ...baseData,
        type: 'movie',
        runtimeMinutes: runtimeMinutes === '' ? undefined : Number(runtimeMinutes),
        rewatchCount: Number(rewatchCount) || 0,
        director: director.trim() || undefined,
      } as MovieItem;
    } else if (type === 'series') {
      fullItem = {
        ...baseData,
        type: 'series',
        currentSeason: Number(currentSeason) || 1,
        totalSeasons: totalSeasons === '' ? undefined : Number(totalSeasons),
        currentEpisode: Number(seriesEpisode) || 0,
        totalEpisodes: seriesTotalEpisodes === '' ? undefined : Number(seriesTotalEpisodes),
        network: network.trim() || undefined,
      } as SeriesItem;
    } else if (type === 'anime') {
      fullItem = {
        ...baseData,
        type: 'anime',
        currentEpisode: Number(animeEpisode) || 0,
        totalEpisodes: animeTotalEpisodes === '' ? undefined : Number(animeTotalEpisodes),
        seasonNumber: Number(animeSeason) || 1,
        studio: studio.trim() || undefined,
        sourceType,
      } as AnimeItem;
    } else {
      fullItem = {
        ...baseData,
        type: 'game',
        hoursPlayed: Number(hoursPlayed) || 0,
        platform: platform.trim() || 'PC',
        completionPercentage: completionPercentage === '' ? undefined : Number(completionPercentage),
        playStyle,
      } as GameItem;
    }

    onSave(fullItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {editingItem ? 'Edit Media Entry' : 'Add to Your Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Media Type Selector */}
          {!editingItem && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Media Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'movie', label: 'Movie', icon: <Film className="w-4 h-4" /> },
                  { id: 'series', label: 'TV Series', icon: <Tv className="w-4 h-4" /> },
                  { id: 'anime', label: 'Anime', icon: <Sparkles className="w-4 h-4" /> },
                  { id: 'game', label: 'Game', icon: <Gamepad2 className="w-4 h-4" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id as MediaType);
                      setSearchResults([]);
                      setSearchFeedback(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      type === t.id
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC ONLINE AUTO-FILL FEATURE */}
          {!editingItem && (
            <div className="p-3.5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950/60 border border-purple-500/30 rounded-2xl">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Search Online & Auto-Fill</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-normal">
                  Live API
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Type any {type} name to automatically fetch the official poster, release year, genres, and synopsis.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Search ${type}... (e.g. ${type === 'anime' ? 'Frieren, Naruto' : type === 'game' ? 'Elden Ring, Zelda' : type === 'series' ? 'Arcane, Severance' : 'Interstellar, Inception'})`}
                  value={onlineQuery}
                  onChange={(e) => setOnlineQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleOnlineSearch();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={handleOnlineSearch}
                  disabled={isSearching}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Auto-Fill</span>
                </button>
              </div>

              {searchFeedback && (
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  {searchFeedback}
                </p>
              )}

              {/* Search Results Dropdown / Grid */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto border-t border-purple-900/40 pt-2">
                  <div className="text-[11px] text-purple-300 font-medium mb-1">
                    Click an item below to apply details:
                  </div>
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleApplySearchResult(res)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 hover:bg-purple-900/30 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all"
                    >
                      {res.posterUrl ? (
                        <img
                          src={res.posterUrl}
                          alt={res.title}
                          className="w-8 h-11 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-11 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 text-[10px]">
                          No art
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-100 truncate">{res.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {res.releaseYear || 'Year unknown'} • {res.genres.join(', ') || 'Genre'}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Favorite */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Title <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                favorite
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-400'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-5 h-5 ${favorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* Status & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="in_progress">{type === 'game' ? 'Playing' : 'Watching'}</option>
                <option value="plan_to_watch">{type === 'game' ? 'Plan to Play' : 'Plan to Watch'}</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Your Rating
                </label>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {rating === 0 ? 'Unrated' : `${rating} / 10`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-950 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Unrated)</span>
                <span>5 (Average)</span>
                <span>10 (Masterpiece)</span>
              </div>
            </div>
          </div>

          {/* Medium-Specific Progress Fields */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{type.toUpperCase()} Specific Details</span>
            </div>

            {/* Movie Fields */}
            {type === 'movie' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Runtime (mins)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="140"
                    value={runtimeMinutes}
                    onChange={(e) => setRuntimeMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rewatch Count</label>
                  <input
                    type="number"
                    min="0"
                    value={rewatchCount}
                    onChange={(e) => setRewatchCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Director</label>
                  <input
                    type="text"
                    placeholder="Christopher Nolan"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* TV Series Fields */}
            {type === 'series' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Current Season</label>
                    <input
                      type="number"
                      min="1"
                      value={currentSeason}
                      onChange={(e) => setCurrentSeason(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total Seasons</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      value={totalSeasons}
                      onChange={(e) => setTotalSeasons(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Current Episode</label>
                    <input
                      type="number"
                      min="0"
                      value={seriesEpisode}
                      onChange={(e) => setSeriesEpisode(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total Episodes</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 62"
                      value={seriesTotalEpisodes}
                      onChange={(e) => setSeriesTotalEpisodes(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Network / Streaming Service</label>
                  <input
                    type="text"
                    placeholder="HBO Max, Netflix, Apple TV+, etc."
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Anime Fields */}
            {type === 'anime' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Current Episode</label>
                    <input
                      type="number"
                      min="0"
                      value={animeEpisode}
                      onChange={(e) => setAnimeEpisode(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total Episodes</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 24"
                      value={animeTotalEpisodes}
                      onChange={(e) => setAnimeTotalEpisodes(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Season #</label>
                    <input
                      type="number"
                      min="1"
                      value={animeSeason}
                      onChange={(e) => setAnimeSeason(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Animation Studio</label>
                    <input
                      type="text"
                      placeholder="MAPPA, Ufotable, Bones, etc."
                      value={studio}
                      onChange={(e) => setStudio(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Source Material</label>
                    <select
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    >
                      <option value="Manga">Manga</option>
                      <option value="Light Novel">Light Novel</option>
                      <option value="Original">Original Work</option>
                      <option value="Visual Novel">Visual Novel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Game Fields */}
            {type === 'game' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hours Played</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={hoursPlayed}
                      onChange={(e) => setHoursPlayed(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Platform</label>
                    <input
                      type="text"
                      list="platform-options"
                      placeholder="PC, PS5, Switch..."
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                    <datalist id="platform-options">
                      {PLATFORM_PRESETS.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Completion %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={completionPercentage}
                      onChange={(e) => setCompletionPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Play Goal / Style</label>
                  <select
                    value={playStyle}
                    onChange={(e) => setPlayStyle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200"
                  >
                    <option value="Main Story">Main Story Campaign</option>
                    <option value="Completionist (100%)">Completionist (100% Achievements)</option>
                    <option value="Casual / Endless">Casual / Endless / Cozy</option>
                    <option value="Multiplayer">Competitive Multiplayer</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Poster Image URL with Live Preview & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Cover Poster Artwork (Image URL)</span>
              <span className="text-[11px] text-slate-500 font-normal">Optional</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                placeholder="https://... (direct image link)"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              {posterUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                  <img src={posterUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Quick Poster Templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500">Pick sample:</span>
              {SAMPLE_POSTERS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setPosterUrl(sp.url)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-purple-600/50 text-slate-300 transition-colors"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres Tag Cloud */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Genres & Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-24 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800">
              {(GENRE_PRESETS[type] || []).map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleToggleGenre(g)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      active
                        ? 'bg-purple-600/40 text-purple-200 border-purple-500/60 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Add custom tag */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag (e.g. Psychological Thriller, Co-op)"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGenre();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Dates & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Release Year</label>
              <input
                type="number"
                min="1900"
                max="2099"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date Started</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date Finished</label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
              />
            </div>
          </div>

          {/* Notes / Thoughts / Review */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Personal Review / Notes / Synopsis
            </label>
            <textarea
              rows={3}
              placeholder="What did you think of the plot, characters, mechanics, atmosphere, ending?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {editingItem ? 'Save Changes' : 'Add to Collection'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
