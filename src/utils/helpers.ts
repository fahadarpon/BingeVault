import confetti from 'canvas-confetti';
import type { MediaItem, MediaStatus, MediaType } from '../types/media';

export function fireCelebrationConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#a855f7', '#6366f1', '#ec4899', '#3b82f6', '#10b981'],
  });
}

export function getStatusLabel(status: MediaStatus, type: MediaType): string {
  switch (status) {
    case 'plan_to_watch':
      return type === 'game' ? 'Plan to Play' : 'Plan to Watch';
    case 'in_progress':
      return type === 'game' ? 'Playing' : 'Watching';
    case 'completed':
      return 'Completed';
    case 'on_hold':
      return 'On Hold';
    case 'dropped':
      return 'Dropped';
  }
}

export function getStatusBadgeClass(status: MediaStatus): string {
  switch (status) {
    case 'in_progress':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'completed':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'plan_to_watch':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'on_hold':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    case 'dropped':
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  }
}

export function getTypeBadgeClass(type: MediaType): string {
  switch (type) {
    case 'movie':
      return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
    case 'series':
      return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
    case 'anime':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    case 'game':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }
}

export function getTypeDisplayName(type: MediaType): string {
  switch (type) {
    case 'movie': return 'Movie';
    case 'series': return 'TV Series';
    case 'anime': return 'Anime';
    case 'game': return 'Game';
  }
}

export function getProgressInfo(item: MediaItem): { text: string; percentage: number | null } {
  if (item.type === 'movie') {
    if (item.status === 'completed') {
      const rewatch = item.rewatchCount > 0 ? ` (${item.rewatchCount} rewatches)` : '';
      return { text: `Watched${rewatch}`, percentage: 100 };
    }
    return { text: item.runtimeMinutes ? `${item.runtimeMinutes} mins` : 'Not watched', percentage: item.status === 'in_progress' ? 50 : 0 };
  }

  if (item.type === 'series') {
    const cur = item.currentEpisode || 0;
    const tot = item.totalEpisodes;
    const seasonText = item.currentSeason ? `S${item.currentSeason} ` : '';
    if (tot) {
      const pct = Math.min(100, Math.round((cur / tot) * 100));
      return { text: `${seasonText}Ep ${cur} / ${tot}`, percentage: pct };
    }
    return { text: `${seasonText}Ep ${cur}`, percentage: null };
  }

  if (item.type === 'anime') {
    const cur = item.currentEpisode || 0;
    const tot = item.totalEpisodes;
    if (tot) {
      const pct = Math.min(100, Math.round((cur / tot) * 100));
      return { text: `Ep ${cur} / ${tot}`, percentage: pct };
    }
    return { text: `Ep ${cur}`, percentage: null };
  }

  if (item.type === 'game') {
    const hrs = `${item.hoursPlayed || 0}h played`;
    const pct = item.completionPercentage ?? (item.status === 'completed' ? 100 : null);
    if (pct !== null) {
      return { text: `${hrs} (${pct}%)`, percentage: pct };
    }
    return { text: hrs, percentage: null };
  }

  return { text: '', percentage: null };
}
