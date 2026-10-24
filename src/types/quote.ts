export interface Quote {
  /** Stable id derived from text + author, used for favorites de-duplication. */
  id: string;
  text: string;
  author: string;
}

export interface FavoriteQuote extends Quote {
  /** ISO timestamp of when the quote was saved. */
  savedAt: string;
}
