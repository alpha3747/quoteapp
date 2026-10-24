import { useCallback, useEffect, useState } from 'react';

import { storageKeys } from '../constants/config';
import {
  cancelDailyReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '../services/notifications';
import { readJson, writeJson } from '../services/storage';
import type { Quote } from '../types/quote';

export type ReminderToggleResult = 'enabled' | 'disabled' | 'denied' | 'error';

/**
 * Persists the user's choice for the 7:00 AM reminder and keeps the
 * scheduled notification's content in sync with the latest quotes.
 */
export function useDailyReminder(upcomingQuote: Quote | null) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    readJson<boolean>(storageKeys.reminderEnabled).then(value =>
      setEnabled(value === true),
    );
  }, []);

  // Refresh the scheduled notification body whenever a new batch arrives.
  useEffect(() => {
    if (enabled && upcomingQuote) {
      scheduleDailyReminder(upcomingQuote).catch(() => undefined);
    }
  }, [enabled, upcomingQuote]);

  const toggle = useCallback(async (): Promise<ReminderToggleResult> => {
    try {
      if (enabled) {
        await cancelDailyReminder();
        setEnabled(false);
        await writeJson(storageKeys.reminderEnabled, false);
        return 'disabled';
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        return 'denied';
      }
      await scheduleDailyReminder(upcomingQuote ?? undefined);
      setEnabled(true);
      await writeJson(storageKeys.reminderEnabled, true);
      return 'enabled';
    } catch (error) {
      if (__DEV__) {
        console.warn('[reminder] Toggle failed', error);
      }
      return 'error';
    }
  }, [enabled, upcomingQuote]);

  return { enabled, toggle };
}
