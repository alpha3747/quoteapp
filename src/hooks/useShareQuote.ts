import { useCallback } from 'react';
import { Share } from 'react-native';

import type { Quote } from '../types/quote';
import { formatQuoteForSharing } from '../utils/quote';

export function useShareQuote() {
  return useCallback(async (quote: Quote) => {
    try {
      await Share.share({ message: formatQuoteForSharing(quote) });
    } catch (error) {
      if (__DEV__) {
        console.warn('[share] Failed to open share sheet', error);
      }
    }
  }, []);
}
