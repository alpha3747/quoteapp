import { parseZenQuotes } from '../src/services/quotesApi';
import {
  createQuote,
  formatQuoteForSharing,
  pickRandomIndex,
  quoteFontSize,
} from '../src/utils/quote';

describe('createQuote', () => {
  it('normalises whitespace and builds a stable id', () => {
    const a = createQuote('  Be   here  now. ', ' Ram Dass ');
    const b = createQuote('be here now.', 'ram dass');
    expect(a.text).toBe('Be here now.');
    expect(a.author).toBe('Ram Dass');
    expect(a.id).toBe(b.id);
  });

  it('falls back to "Unknown" for a missing author', () => {
    expect(createQuote('Hello', '   ').author).toBe('Unknown');
  });
});

describe('parseZenQuotes', () => {
  it('maps, de-duplicates and drops rate-limit messages', () => {
    const quotes = parseZenQuotes([
      { q: 'One', a: 'A' },
      { q: 'One', a: 'A' },
      {
        q: 'Too many requests. Obtain an auth key at zenquotes.io',
        a: 'zenquotes.io',
      },
      { q: '', a: 'Empty' },
      { q: 'Two', a: 'B' },
    ]);
    expect(quotes.map(q => q.text)).toEqual(['One', 'Two']);
  });

  it('returns an empty list for unexpected payloads', () => {
    expect(parseZenQuotes({ error: true })).toEqual([]);
    expect(parseZenQuotes(null)).toEqual([]);
  });
});

describe('pickRandomIndex', () => {
  it('never returns the current index', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickRandomIndex(5, 2)).not.toBe(2);
    }
  });

  it('covers the full range', () => {
    expect(pickRandomIndex(3, 0, () => 0)).toBe(1);
    expect(pickRandomIndex(3, 0, () => 0.99)).toBe(2);
    expect(pickRandomIndex(1, 0)).toBe(0);
  });
});

describe('formatting', () => {
  it('formats a quote for sharing', () => {
    const text = formatQuoteForSharing(createQuote('Stay curious.', 'Someone'));
    expect(text).toContain('“Stay curious.”');
    expect(text).toContain('— Someone');
  });

  it('shrinks the font for long quotes', () => {
    expect(quoteFontSize('short')).toBeGreaterThan(
      quoteFontSize('x'.repeat(300)),
    );
  });
});
