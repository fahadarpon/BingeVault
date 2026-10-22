import React from 'react';
import { 
  X, 
  BarChart3, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  Star
} from 'lucide-react';
import type { MediaItem } from '../types/media';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  const movies = items.filter((i) => i.type === 'movie');
  const series = items.filter((i) => i.type === 'series');
  const animes = items.filter((i) => i.type === 'anime');
  const games = items.filter((i) => i.type === 'game');

  // Total gaming hours
  const totalGamingHours = games.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0);

  // Total episodes watched
  const totalSeriesEpisodes = series.reduce((acc, s) => acc + (s.currentEpisode || 0), 0);
  const totalAnimeEpisodes = animes.reduce((acc, a) => acc + (a.currentEpisode || 0), 0);
  const totalEpisodesWatched = totalSeriesEpisodes + totalAnimeEpisodes;

  // Completed items count
  const completedItems = items.filter((i) => i.status === 'completed');
  const completionRate = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;

  // Average Rating
  const ratedItems = items.filter((i) => i.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, i) => acc + i.rating, 0) / ratedItems.length).toFixed(1)
    : 'N/A';

  // Masterpieces (Rating >= 9)
  const masterpieces = [...items]
    .filter((i) => i.rating >= 9)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Entertainment Analytics</h2>
              <p className="text-xs text-slate-400">Lifetime statistics across your media journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Gaming Hours</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {totalGamingHours} <span className="text-sm font-normal text-slate-400">hrs</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Episodes Watched</span>
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {totalEpisodesWatched} <span className="text-sm font-normal text-slate-400">eps</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Completion Rate</span>
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {completionRate}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Avg Rating</span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {avgRating} <span className="text-sm font-normal text-slate-500">/ 10</span>
              </div>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Category Distribution ({items.length} Total Titles)
            </h3>

            {/* Proportion Bar */}
            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex mb-4">
              <div style={{ width: `${items.length ? (movies.length / items.length) * 100 : 0}%` }} className="bg-pink-500" title={`Movies: ${movies.length}`} />
              <div style={{ width: `${items.length ? (series.length / items.length) * 100 : 0}%` }} className="bg-violet-500" title={`Series: ${series.length}`} />
              <div style={{ width: `${items.length ? (animes.length / items.length) * 100 : 0}%` }} className="bg-cyan-500" title={`Anime: ${animes.length}`} />
              <div style={{ width: `${items.length ? (games.length / items.length) * 100 : 0}%` }} className="bg-emerald-500" title={`Games: ${games.length}`} />
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-slate-300 font-medium">Movies:</span>
                <span className="text-slate-400 font-mono font-bold">{movies.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-slate-300 font-medium">Series:</span>
                <span className="text-slate-400 font-mono font-bold">{series.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-300 font-medium">Anime:</span>
                <span className="text-slate-400 font-mono font-bold">{animes.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">Games:</span>
                <span className="text-slate-400 font-mono font-bold">{games.length}</span>
              </div>
            </div>
          </div>

          {/* Masterpieces & Top Rated Showcase */}
          {masterpieces.length > 0 && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Hall of Fame (★ 9.0+)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {masterpieces.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <img
                      src={item.posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-10 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{item.type} • {item.releaseYear || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-400 pr-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
