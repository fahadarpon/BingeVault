import React from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Sparkles, 
  Film, 
  Tv, 
  Gamepad2, 
  ChevronRight,
  Flame
} from 'lucide-react';
import type { MediaItem } from '../types/media';
import { getTypeBadgeClass, getTypeDisplayName, getProgressInfo } from '../utils/helpers';

interface UpNextSectionProps {
  items: MediaItem[];
  onEdit: (item: MediaItem) => void;
  onIncrementProgress: (item: MediaItem, amount?: number) => void;
  onQuickStatusChange: (item: MediaItem, status: MediaItem['status']) => void;
  onGoToDiscover: () => void;
}

export const UpNextSection: React.FC<UpNextSectionProps> = ({
  items,
  onEdit,
  onIncrementProgress,
  onQuickStatusChange,
  onGoToDiscover,
}) => {
  const activeItems = items.filter((i) => i.status === 'in_progress');

  if (activeItems.length === 0) return null;

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'movie': return <Film className="w-3.5 h-3.5" />;
      case 'series': return <Tv className="w-3.5 h-3.5" />;
      case 'anime': return <Sparkles className="w-3.5 h-3.5" />;
      case 'game': return <Gamepad2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="mb-10">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Up Next to Watch & Play</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                {activeItems.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">Jump right back into your in-progress backlog</p>
          </div>
        </div>

        <button
          onClick={onGoToDiscover}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Explore More</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Carousel of Up Next Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeItems.map((item) => {
          const progress = getProgressInfo(item);

          return (
            <div
              key={item.id}
              className="group relative flex flex-col bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 hover:-translate-y-0.5"
            >
              <div className="flex gap-3">
                {/* Poster Thumbnail */}
                <div 
                  onClick={() => onEdit(item)}
                  className="relative w-20 h-28 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 cursor-pointer border border-slate-800 group-hover:border-purple-500/40 transition-colors shadow"
                >
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      {getMediaIcon(item.type)}
                    </div>
                  )}

                  {/* Play Overlay Icon on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getTypeBadgeClass(item.type)}`}>
                        {getTypeDisplayName(item.type)}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onEdit(item)}
                      className="font-bold text-slate-100 group-hover:text-purple-300 text-sm truncate cursor-pointer"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-purple-300 font-mono font-medium mt-0.5">
                      {progress.text}
                    </p>
                  </div>

                  {/* Progress percentage bar */}
                  {progress.percentage !== null && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                      />
                    </div>
                  )}

                  {/* Next Action Button */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {(item.type === 'anime' || item.type === 'series') && (
                      <button
                        onClick={() => onIncrementProgress(item, 1)}
                        className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                        title="Watch next episode"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Ep {(item.currentEpisode || 0) + 1}</span>
                      </button>
                    )}

                    {item.type === 'game' && (
                      <button
                        onClick={() => onIncrementProgress(item, 1)}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                        title="Log +1 Hour Played"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log 1h</span>
                      </button>
                    )}

                    <button
                      onClick={() => onQuickStatusChange(item, 'completed')}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 transition-colors"
                      title="Mark as Completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
