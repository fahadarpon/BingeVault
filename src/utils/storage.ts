import type { MediaItem } from '../types/media';
import { INITIAL_ITEMS } from '../data/sampleData';

const STORAGE_KEY = 'omnitrack_media_items_v1';

export function loadMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveMediaItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ITEMS;
  } catch (error) {
    console.error('Failed to load items from storage:', error);
    return INITIAL_ITEMS;
  }
}

export function saveMediaItems(items: MediaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save items to storage:', error);
  }
}

export function exportBackup(items: MediaItem[]): void {
  const json = JSON.stringify(items, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnitrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<MediaItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          resolve(parsed as MediaItem[]);
        } else {
          reject(new Error('Invalid JSON format: expected an array of items.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
