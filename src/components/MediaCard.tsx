import React from 'react';
import { 
  Star, 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad2, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Play,
  RotateCcw
} from 'lucide-react';
import type { MediaItem } from '../types/media';
import { 
  getStatusBadgeClass, 
  getStatusLabel, 
  getTypeBadgeClass, 
  getTypeDisplayName, 
  getProgressInfo 
} from '../utils/helpers';

interface MediaCardProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementProgress: (item: MediaItem, amount?: number) => void;
  onQuickStatusChange: (item: MediaItem, status: MediaItem['status']) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementProgress,
  onQuickStatusChange,
}) => {
  const progress = getProgressInfo(item);

  const getMediaIcon = () => {
    switch (item.type) {
      case 'movie': return <Film className="w-3.5 h-3.5" />;
      case 'series': return <Tv className="w-3.5 h-3.5" />;
      case 'anime': return <Sparkles className="w-3.5 h-3.5" />;
      case 'game': return <Gamepad2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="group relative flex flex-col bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 hover:-translate-y-1">
      
      {/* Poster Image Container */}
      <div 
        className="relative aspect-[16/10] sm:aspect-[3/4] w-full bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => onEdit(item)}
      >
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600">
            {getMediaIcon()}
            <span className="text-xs mt-1">No Poster</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          {/* Media Type Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border backdrop-blur-md shadow-sm ${getTypeBadgeClass(item.type)}`}>
            {getMediaIcon()}
            {getTypeDisplayName(item.type)}
          </span>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              item.favorite
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-md'
                : 'bg-black/40 text-slate-400 hover:text-white border border-white/10'
            }`}
            title={item.favorite ? 'Remove favorite' : 'Mark as favorite'}
          >
            <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Floating Rating Badge bottom left of image */}
        {item.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold shadow">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">/10</span>
          </div>
        )}

        {/* Year bottom right */}
        {item.releaseYear && (
          <div className="absolute bottom-2.5 right-2.5 text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
            {item.releaseYear}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-4">
        
        {/* Title */}
        <div className="mb-1.5">
          <h3 
            onClick={() => onEdit(item)}
            className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1 text-base cursor-pointer"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Medium Specific Subtitle */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            {item.type === 'game' && (
              <span className="text-emerald-400 font-medium">{item.platform}</span>
            )}
            {item.type === 'series' && item.network && (
              <span className="text-violet-400 font-medium">{item.network}</span>
            )}
            {item.type === 'anime' && item.studio && (
              <span className="text-cyan-400 font-medium">{item.studio}</span>
            )}
            {item.type === 'movie' && item.director && (
              <span className="text-pink-400 line-clamp-1">Dir: {item.director}</span>
            )}
          </div>
        </div>

        {/* Genres */}
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {g}
              </span>
            ))}
            {item.genres.length > 3 && (
              <span className="text-[10px] px-1 py-0.5 text-slate-500">
                +{item.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progress Display */}
        <div className="mt-auto pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getStatusBadgeClass(item.status)}`}>
              {getStatusLabel(item.status, item.type)}
            </span>
            <span className="text-slate-300 font-mono text-xs font-medium">
              {progress.text}
            </span>
          </div>

          {/* Progress Bar (if applicable) */}
          {progress.percentage !== null && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percentage >= 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1 pt-1 mt-1">
            
            {/* Quick Progress Increments */}
            <div className="flex items-center gap-1">
              {(item.type === 'anime' || item.type === 'series') && item.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => onIncrementProgress(item, 1)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-purple-600/80 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-purple-500 transition-all shadow-sm"
                  title="Watch next episode (+1 Ep)"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ep</span>
                </button>
              )}

              {item.type === 'game' && item.status !== 'completed' && (
                <>
                  <button
                    type="button"
                    onClick={() => onIncrementProgress(item, 1)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/80 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-all shadow-sm"
                    title="+1 hour played"
                  >
                    <Plus className="w-3 h-3" />
                    <span>1h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onIncrementProgress(item, 5)}
                    className="flex items-center gap-0.5 px-1.5 py-1 rounded bg-slate-800/70 hover:bg-emerald-600/80 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 hover:border-emerald-500 transition-all"
                    title="+5 hours played"
                  >
                    <span>+5h</span>
                  </button>
                </>
              )}

              {item.type === 'movie' && item.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => onIncrementProgress(item, 1)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-pink-600/80 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-pink-500 transition-all shadow-sm"
                  title="Rewatched movie (+1 Rewatch)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rewatch</span>
                </button>
              )}

              {item.status !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => onQuickStatusChange(item, 'completed')}
                  className="p-1 rounded bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 transition-colors"
                  title="Mark as Completed"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickStatusChange(item, 'in_progress')}
                  className="p-1 rounded bg-slate-800/80 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-700 transition-colors"
                  title={item.type === 'game' ? 'Reopen (Playing)' : 'Reopen (Watching)'}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Edit / Delete */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit item details"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
