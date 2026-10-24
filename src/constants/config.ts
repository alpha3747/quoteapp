export const config = {
  zenQuotesUrl: 'https://zenquotes.io/api/quotes',
  // Keep this short: the UI never waits longer than this on a slow network.
  requestTimeoutMs: 5000,
  reminder: {
    hour: 7,
    minute: 0,
  },
} as const;

export const storageKeys = {
  dailyQuote: '@quotely/daily-quote',
  favorites: '@quotely/favorites',
  reminderEnabled: '@quotely/reminder-enabled',
  hasSeenHint: '@quotely/has-seen-hint',
} as const;
