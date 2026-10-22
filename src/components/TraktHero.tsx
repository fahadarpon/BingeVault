import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Star, 
  Sparkles, 
  Film, 
  Tv, 
  Gamepad2, 
  ChevronRight, 
  ChevronLeft,
  Info
} from 'lucide-react';
import type { MediaItem } from '../types/media';
import { getTypeBadgeClass, getTypeDisplayName, getProgressInfo } from '../utils/helpers';

interface TraktHeroProps {
  items: MediaItem[];
  onEdit: (item: MediaItem) => void;
  onIncrementProgress: (item: MediaItem, amount?: number) => void;
  onQuickStatusChange: (item: MediaItem, status: MediaItem['status']) => void;
}

export const TraktHero: React.FC<TraktHeroProps> = ({
  items,
  onEdit,
  onIncrementProgress,
  onQuickStatusChange,
}) => {
  // Pick active (in_progress) or highest-rated items for hero spotlight
  const spotlightItems = React.useMemo(() => {
    const inProgress = items.filter((i) => i.status === 'in_progress');
    if (inProgress.length >= 3) return inProgress.slice(0, 5);
    const topRated = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return topRated.slice(0, 5);
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate hero banner every 7 seconds
  useEffect(() => {
    if (spotlightItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [spotlightItems.length]);

  if (spotlightItems.length === 0) return null;

  const current = spotlightItems[currentIndex] || spotlightItems[0];
  const progress = getProgressInfo(current);

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'movie': return <Film className="w-3.5 h-3.5" />;
      case 'series': return <Tv className="w-3.5 h-3.5" />;
      case 'anime': return <Sparkles className="w-3.5 h-3.5" />;
      case 'game': return <Gamepad2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-slate-950 group/hero">
      
      {/* Background Image Banner with Dark Vignette Gradients */}
      <div className="relative h-[340px] sm:h-[420px] md:h-[460px] w-full overflow-hidden">
        <img
          src={current.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80'}
          alt={current.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 filter brightness-60"
        />

        {/* Multi-layered cinematic gradients (Trakt-style dark fade) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-transparent max-w-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />

        {/* Navigation Arrows */}
        {spotlightItems.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length)}
              className="p-2 rounded-full bg-black/60 hover:bg-purple-600 text-white backdrop-blur-md border border-white/10 transition-all shadow-lg"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlightItems.length)}
              className="p-2 rounded-full bg-black/60 hover:bg-purple-600 text-white backdrop-blur-md border border-white/10 transition-all shadow-lg"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Spotlight Content Container */}
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-end max-w-2xl z-10">
          
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${getTypeBadgeClass(current.type)}`}>
              {getMediaIcon(current.type)}
              <span>{getTypeDisplayName(current.type)}</span>
            </span>

            {current.releaseYear && (
              <span className="px-2 py-0.5 rounded-lg bg-black/60 text-slate-300 border border-white/10 text-xs font-mono font-medium">
                {current.releaseYear}
              </span>
            )}

            {current.rating > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{current.rating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-200/70 font-normal">/10</span>
              </span>
            )}

            {current.status === 'in_progress' && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold animate-pulse">
                ● Currently {current.type === 'game' ? 'Playing' : 'Watching'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 
            onClick={() => onEdit(current)}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 cursor-pointer hover:text-purple-300 transition-colors drop-shadow-md mb-2"
          >
            {current.title}
          </h1>

          {/* Progress / Context Subtitle */}
          <div className="text-sm font-medium text-purple-300/90 mb-3 flex items-center gap-2">
            <span>{progress.text}</span>
            {current.type === 'game' && <span>• {current.platform}</span>}
            {current.type === 'series' && current.network && <span>• {current.network}</span>}
            {current.type === 'anime' && current.studio && <span>• {current.studio}</span>}
          </div>

          {/* Description */}
          {current.notes && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-xl mb-5 leading-relaxed drop-shadow">
              {current.notes}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {/* Direct check-in / next episode button */}
            {(current.type === 'anime' || current.type === 'series') && current.status !== 'completed' && (
              <button
                onClick={() => onIncrementProgress(current, 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Next Episode (Ep {(current.currentEpisode || 0) + 1})</span>
              </button>
            )}

            {current.type === 'game' && current.status !== 'completed' && (
              <button
                onClick={() => onIncrementProgress(current, 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                <span>Log +1 Hour Played</span>
              </button>
            )}

            {current.status !== 'completed' ? (
              <button
                onClick={() => onQuickStatusChange(current, 'completed')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            ) : (
              <button
                onClick={() => onQuickStatusChange(current, 'in_progress')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-500/20 text-slate-200 hover:text-blue-300 border border-slate-700 hover:border-blue-500/50 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Reopen</span>
              </button>
            )}

            <button
              onClick={() => onEdit(current)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>

        </div>

        {/* Carousel Indicator Dots */}
        {spotlightItems.length > 1 && (
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
            {spotlightItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-6 bg-purple-500 shadow-md shadow-purple-500/50'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
