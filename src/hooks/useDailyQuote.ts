import { useCallback, useEffect, useRef, useState } from 'react';

import { storageKeys } from '../constants/config';
import { FALLBACK_QUOTES } from '../constants/fallbackQuotes';
import { fetchQuotes } from '../services/quotesApi';
import { readJson, writeJson } from '../services/storage';
import type { Quote } from '../types/quote';
import { dayOfYear, todayKey } from '../utils/date';
import { pickRandomIndex } from '../utils/quote';

interface DailySnapshot {
  date: string;
  quotes: Quote[];
  index: number;
  isOffline: boolean;
}

/**
 * - `loading`: nothing to show yet (first launch, no cache) — show a loader.
 * - `ready`:   a quote is on screen (it may still be updating in the background).
 */
export type DailyQuoteStatus = 'loading' | 'ready';

export interface UseDailyQuoteResult {
  status: DailyQuoteStatus;
  quote: Quote | null;
  /** The quote that will be "quote of the day" tomorrow (used for reminders). */
  upcomingQuote: Quote | null;
  isOffline: boolean;
  /** True while today's quotes are being fetched behind an already-visible quote. */
  isUpdating: boolean;
  /** True while a pull-to-refresh is in progress. */
  isRefreshing: boolean;
  /** Re-fetches a fresh batch of quotes from the network. */
  refresh: () => Promise<void>;
  /** Shows another quote from today's batch (no network needed). */
  shuffle: () => void;
}

async function buildSnapshot(
  previous: DailySnapshot | null,
): Promise<DailySnapshot> {
  let quotes: Quote[];
  let isOffline = false;
  try {
    quotes = await fetchQuotes();
  } catch (error) {
    if (__DEV__) {
      console.warn('[quotes] Falling back to cached/bundled quotes', error);
    }
    quotes = previous?.quotes?.length ? previous.quotes : FALLBACK_QUOTES;
    isOffline = true;
  }

  return {
    date: todayKey(),
    quotes,
    index: dayOfYear() % quotes.length,
    isOffline,
  };
}

/**
 * Owns the "quote of the day" lifecycle without ever blocking the UI:
 * 1. Today's cached quote → shown instantly, no network.
 * 2. An older cached quote → shown instantly while today's batch loads quietly.
 * 3. Nothing cached (first launch) → loader until the fetch succeeds or
 *    times out, then bundled quotes as a fallback.
 */
export function useDailyQuote(): UseDailyQuoteResult {
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const snapshotRef = useRef<DailySnapshot | null>(null);

  const show = useCallback((next: DailySnapshot) => {
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  const commit = useCallback(
    (next: DailySnapshot) => {
      show(next);
      writeJson(storageKeys.dailyQuote, next);
    },
    [show],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await readJson<DailySnapshot>(storageKeys.dailyQuote);
      if (cancelled) {
        return;
      }
      const hasCache = !!cached && cached.quotes?.length > 0;
      if (hasCache && cached.date === todayKey()) {
        show(cached);
        return;
      }
      if (hasCache) {
        // Stale but useful: show it right away, update in the background.
        show(cached);
        setIsUpdating(true);
      }
      try {
        const next = await buildSnapshot(cached);
        if (!cancelled) {
          commit(next);
        }
      } finally {
        if (!cancelled) {
          setIsUpdating(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commit, show]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const next = await buildSnapshot(snapshotRef.current);
      // A manual refresh should always reveal something new.
      if (next.quotes.length > 1) {
        next.index = pickRandomIndex(next.quotes.length, next.index);
      }
      commit(next);
    } finally {
      setIsRefreshing(false);
    }
  }, [commit]);

  const shuffle = useCallback(() => {
    const current = snapshotRef.current;
    if (!current || current.quotes.length < 2) {
      return;
    }
    commit({
      ...current,
      index: pickRandomIndex(current.quotes.length, current.index),
    });
  }, [commit]);

  const quotes = snapshot?.quotes ?? [];
  return {
    status: snapshot ? 'ready' : 'loading',
    quote: quotes[snapshot?.index ?? 0] ?? null,
    upcomingQuote: quotes.length
      ? quotes[(dayOfYear() + 1) % quotes.length]
      : null,
    isOffline: snapshot?.isOffline ?? false,
    isUpdating,
    isRefreshing,
    refresh,
    shuffle,
  };
}
