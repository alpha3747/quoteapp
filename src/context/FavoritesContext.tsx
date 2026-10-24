import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { storageKeys } from '../constants/config';
import { readJson, writeJson } from '../services/storage';
import type { FavoriteQuote, Quote } from '../types/quote';

interface FavoritesContextValue {
  favorites: FavoriteQuote[];
  isLoaded: boolean;
  isFavorite: (id: string) => boolean;
  /** Adds the quote if missing, removes it otherwise. Returns the new state. */
  toggleFavorite: (quote: Quote) => boolean;
  removeFavorite: (id: string) => FavoriteQuote | undefined;
  restoreFavorite: (favorite: FavoriteQuote) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Newest first. */
const sortFavorites = (list: FavoriteQuote[]) =>
  [...list].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteQuote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Mirror of state so callbacks can return synchronous results.
  const favoritesRef = useRef<FavoriteQuote[]>([]);

  useEffect(() => {
    let cancelled = false;
    readJson<FavoriteQuote[]>(storageKeys.favorites).then(stored => {
      if (cancelled) {
        return;
      }
      const list = Array.isArray(stored) ? sortFavorites(stored) : [];
      favoritesRef.current = list;
      setFavorites(list);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: FavoriteQuote[]) => {
    favoritesRef.current = next;
    setFavorites(next);
    writeJson(storageKeys.favorites, next);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some(item => item.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (quote: Quote) => {
      const current = favoritesRef.current;
      if (current.some(item => item.id === quote.id)) {
        commit(current.filter(item => item.id !== quote.id));
        return false;
      }
      commit([{ ...quote, savedAt: new Date().toISOString() }, ...current]);
      return true;
    },
    [commit],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      const current = favoritesRef.current;
      const removed = current.find(item => item.id === id);
      if (removed) {
        commit(current.filter(item => item.id !== id));
      }
      return removed;
    },
    [commit],
  );

  const restoreFavorite = useCallback(
    (favorite: FavoriteQuote) => {
      const current = favoritesRef.current;
      if (!current.some(item => item.id === favorite.id)) {
        commit(sortFavorites([...current, favorite]));
      }
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      favorites,
      isLoaded,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      restoreFavorite,
    }),
    [
      favorites,
      isLoaded,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      restoreFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside <FavoritesProvider>');
  }
  return context;
}
