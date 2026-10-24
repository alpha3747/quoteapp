import { config } from '../constants/config';
import type { Quote } from '../types/quote';
import { createQuote } from '../utils/quote';
import { fetchJson } from './http';

/** Shape returned by https://zenquotes.io/api/quotes */
interface ZenQuote {
  q?: string;
  a?: string;
}

/**
 * Converts the raw ZenQuotes payload into clean, de-duplicated quotes.
 * ZenQuotes returns a single "Too many requests" pseudo-quote when
 * rate-limited, so those entries are filtered out.
 */
export function parseZenQuotes(payload: unknown): Quote[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  const seen = new Set<string>();
  const quotes: Quote[] = [];
  for (const item of payload as ZenQuote[]) {
    if (!item?.q || !item?.a) {
      continue;
    }
    if (/too many requests|zenquotes\.io/i.test(item.q)) {
      continue;
    }
    const quote = createQuote(item.q, item.a);
    if (!seen.has(quote.id)) {
      seen.add(quote.id);
      quotes.push(quote);
    }
  }
  return quotes;
}

export async function fetchQuotes(): Promise<Quote[]> {
  const payload = await fetchJson<unknown>(config.zenQuotesUrl);
  const quotes = parseZenQuotes(payload);
  if (quotes.length === 0) {
    throw new Error('Quote service returned no usable quotes');
  }
  return quotes;
}
