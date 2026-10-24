import type { Quote } from '../types/quote';

/** Small, fast, deterministic string hash (djb2) — good enough for ids. */
/* eslint-disable no-bitwise */
export function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
/* eslint-enable no-bitwise */

export function createQuote(text: string, author: string): Quote {
  const cleanText = text.trim().replace(/\s+/g, ' ');
  const cleanAuthor = author.trim() || 'Unknown';
  return {
    id: hashString(`${cleanText.toLowerCase()}|${cleanAuthor.toLowerCase()}`),
    text: cleanText,
    author: cleanAuthor,
  };
}

/** Text that is shared to other apps from the Share sheet. */
export function formatQuoteForSharing(quote: Quote): string {
  return `“${quote.text}”\n— ${quote.author}\n\nShared from Quotely`;
}

/** Picks a random index different from `current` (when possible). */
export function pickRandomIndex(
  length: number,
  current: number,
  random: () => number = Math.random,
): number {
  if (length <= 1) {
    return 0;
  }
  const next = Math.floor(random() * (length - 1));
  return next >= current ? next + 1 : next;
}

/** Quote text gets smaller as it gets longer so it always fits nicely. */
export function quoteFontSize(text: string): number {
  if (text.length > 220) {
    return 20;
  }
  if (text.length > 140) {
    return 24;
  }
  if (text.length > 80) {
    return 28;
  }
  return 32;
}
