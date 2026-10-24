import type { Quote } from '../types/quote';
import { createQuote } from '../utils/quote';

/**
 * Bundled quotes used when the network is unavailable, so the app
 * always has something meaningful to show.
 */
export const FALLBACK_QUOTES: Quote[] = [
  ['The journey of a thousand miles begins with one step.', 'Lao Tzu'],
  [
    'Waste no more time arguing what a good man should be. Be one.',
    'Marcus Aurelius',
  ],
  ['We suffer more often in imagination than in reality.', 'Seneca'],
  ['Well begun is half done.', 'Aristotle'],
  ['Nature does not hurry, yet everything is accomplished.', 'Lao Tzu'],
  [
    'It does not matter how slowly you go as long as you do not stop.',
    'Confucius',
  ],
  [
    'The happiness of your life depends upon the quality of your thoughts.',
    'Marcus Aurelius',
  ],
  ['Luck is what happens when preparation meets opportunity.', 'Seneca'],
  ['He who has a why to live can bear almost any how.', 'Friedrich Nietzsche'],
  ['Simplicity is the ultimate sophistication.', 'Leonardo da Vinci'],
  ['What we achieve inwardly will change outer reality.', 'Plutarch'],
  ['The best way out is always through.', 'Robert Frost'],
].map(([text, author]) => createQuote(text, author));
