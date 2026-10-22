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
  Play
} from 'lucide-react';
import type { MediaItem } from '../types/media';
import { 
  getStatusBadgeClass, 
  getStatusLabel, 
  getTypeBadgeClass, 
  getProgressInfo 
} from '../utils/helpers';

interface MediaListItemProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementProgress: (item: MediaItem, amount?: number) => void;
  onQuickStatusChange: (item: MediaItem, status: MediaItem['status']) => void;
}

export const MediaListItem: React.FC<MediaListItemProps> = ({
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
      case 'movie': return <Film className="w-4 h-4 text-pink-400" />;
      case 'series': return <Tv className="w-4 h-4 text-violet-400" />;
      case 'anime': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'game': return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all group">
      
      {/* Thumbnail */}
      <div 
        onClick={() => onEdit(item)}
        className="relative w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 cursor-pointer border border-slate-800"
      >
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            {getMediaIcon()}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getTypeBadgeClass(item.type)}`}>
            {getMediaIcon()}
            <span className="hidden sm:inline capitalize">{item.type}</span>
          </span>

          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(item.status)}`}>
            {getStatusLabel(item.status, item.type)}
          </span>

          {item.releaseYear && (
            <span className="text-[11px] text-slate-500 font-mono">
              {item.releaseYear}
            </span>
          )}

          {item.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 
          onClick={() => onEdit(item)}
          className="font-bold text-slate-200 group-hover:text-purple-300 text-sm sm:text-base truncate cursor-pointer mt-1"
        >
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
          <span className="font-mono text-slate-300">{progress.text}</span>
          {item.type === 'game' && <span className="text-emerald-400">• {item.platform}</span>}
          {item.type === 'anime' && item.studio && <span className="text-cyan-400">• {item.studio}</span>}
          {item.type === 'series' && item.network && <span className="text-violet-400">• {item.network}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        
        {/* Progress Increment */}
        {(item.type === 'anime' || item.type === 'series') && item.status !== 'completed' && (
          <button
            type="button"
            onClick={() => onIncrementProgress(item, 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="+1 Episode"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ep</span>
          </button>
        )}

        {item.type === 'game' && item.status !== 'completed' && (
          <button
            type="button"
            onClick={() => onIncrementProgress(item, 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="+1 Hour played"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>1h</span>
          </button>
        )}

        {/* Quick status button */}
        {item.status !== 'completed' ? (
          <button
            type="button"
            onClick={() => onQuickStatusChange(item, 'completed')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 transition-colors"
            title="Mark Completed"
          >
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onQuickStatusChange(item, 'in_progress')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-700 transition-colors"
            title="Reopen"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          className={`p-1.5 rounded-lg border transition-all ${
            item.favorite
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800'
          }`}
          title="Favorite"
        >
          <Star className={`w-4 h-4 ${item.favorite ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Edit */}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
