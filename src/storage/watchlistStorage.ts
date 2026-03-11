import { createMMKV } from 'react-native-mmkv';

const WATCHLIST_KEY = 'watchlist';

export type WatchlistItem = {
  id: string;
  title: string;
  releaseDate: string;
  overview: string;
  poster: string;
  rating: number;
  addedAt: string;
};

const storage = createMMKV({ id: 'movie-watchlist' });

function getRaw(): string | undefined {
  return storage.getString(WATCHLIST_KEY);
}

function getAll(): WatchlistItem[] {
  const raw = getRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: WatchlistItem[]): void {
  storage.set(WATCHLIST_KEY, JSON.stringify(items));
}

export const watchlistStorage = {
  getAll,

  add(item: WatchlistItem): void {
    const list = getAll();
    if (list.some((m) => m.id === item.id)) return;
    list.push(item);
    save(list);
  },

  remove(movieId: string): void {
    const list = getAll().filter((m) => m.id !== movieId);
    save(list);
  },

  isInWatchlist(movieId: string): boolean {
    return getAll().some((m) => m.id === String(movieId));
  },
};
