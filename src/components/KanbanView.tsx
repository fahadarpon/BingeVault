import React from 'react';
import type { MediaItem, MediaStatus } from '../types/media';
import { 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad2, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  CheckCircle2,
  Bookmark,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { getTypeBadgeClass, getTypeDisplayName, getProgressInfo } from '../utils/helpers';

interface KanbanViewProps {
  items: MediaItem[];
  onEdit: (item: MediaItem) => void;
  onIncrementProgress: (item: MediaItem, amount?: number) => void;
  onStatusChange: (item: MediaItem, newStatus: MediaStatus) => void;
}

const COLUMNS: { id: MediaStatus; label: string; icon: React.ReactNode; color: string; border: string }[] = [
  { id: 'plan_to_watch', label: 'Plan to Watch / Play', icon: <Bookmark className="w-4 h-4 text-amber-400" />, color: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'in_progress', label: 'In Progress (Active)', icon: <Clock className="w-4 h-4 text-blue-400" />, color: 'text-blue-400', border: 'border-blue-500/30' },
  { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, color: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'on_hold', label: 'On Hold', icon: <PauseCircle className="w-4 h-4 text-purple-400" />, color: 'text-purple-400', border: 'border-purple-500/30' },
  { id: 'dropped', label: 'Dropped', icon: <XCircle className="w-4 h-4 text-rose-400" />, color: 'text-rose-400', border: 'border-rose-500/30' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  items,
  onEdit,
  onIncrementProgress,
  onStatusChange,
}) => {
  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'movie': return <Film className="w-3 h-3 text-pink-400" />;
      case 'series': return <Tv className="w-3 h-3 text-violet-400" />;
      case 'anime': return <Sparkles className="w-3 h-3 text-cyan-400" />;
      case 'game': return <Gamepad2 className="w-3 h-3 text-emerald-400" />;
    }
  };

  const getNextStatus = (current: MediaStatus): MediaStatus | null => {
    switch (current) {
      case 'plan_to_watch': return 'in_progress';
      case 'in_progress': return 'completed';
      case 'completed': return 'plan_to_watch';
      default: return null;
    }
  };

  const getPrevStatus = (current: MediaStatus): MediaStatus | null => {
    switch (current) {
      case 'completed': return 'in_progress';
      case 'in_progress': return 'plan_to_watch';
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 min-w-[260px] h-[calc(100vh-250px)] min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {col.icon}
                <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {colItems.length}
              </span>
            </div>

            {/* Column Items */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {colItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs">
                  No items
                </div>
              ) : (
                colItems.map((item) => {
                  const progress = getProgressInfo(item);
                  const next = getNextStatus(item.status);
                  const prev = getPrevStatus(item.status);

                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-950/90 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 rounded-xl p-2.5 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex gap-2.5">
                        {/* Thumbnail */}
                        <div 
                          onClick={() => onEdit(item)}
                          className="w-12 h-16 rounded-md bg-slate-900 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-800"
                        >
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getMediaIcon(item.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${getTypeBadgeClass(item.type)}`}>
                              {getTypeDisplayName(item.type)}
                            </span>
                            {item.rating > 0 && (
                              <span className="flex items-center text-[11px] font-bold text-amber-400">
                                <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                                {item.rating.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => onEdit(item)}
                            className="text-xs font-bold text-slate-200 hover:text-purple-300 truncate cursor-pointer"
                            title={item.title}
                          >
                            {item.title}
                          </h4>

                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {progress.text}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {(item.type === 'anime' || item.type === 'series') && item.status !== 'completed' && (
                            <button
                              onClick={() => onIncrementProgress(item, 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-purple-600 text-[10px] font-semibold text-slate-200 transition-colors"
                              title="+1 Episode"
                            >
                              +1 Ep
                            </button>
                          )}
                          {item.type === 'game' && item.status !== 'completed' && (
                            <button
                              onClick={() => onIncrementProgress(item, 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-600 text-[10px] font-semibold text-slate-200 transition-colors"
                              title="+1 Hour"
                            >
                              +1h
                            </button>
                          )}
                        </div>

                        {/* Move status buttons */}
                        <div className="flex items-center gap-1">
                          {prev && (
                            <button
                              onClick={() => onStatusChange(item, prev)}
                              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => onStatusChange(item, next)}
                              className="p-1 rounded text-slate-500 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                              title="Advance forward"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
