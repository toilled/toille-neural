/**
 * Semantic Similarity & Token Matching Helpers.
 * All functions adhere strictly to cyclomatic & cognitive complexity <= 5.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "can",
  "you",
  "tell",
  "me",
  "please",
  "how",
  "what",
  "why",
  "where",
  "when",
  "which",
  "who",
  "do",
  "does",
  "did",
  "about",
  "work",
  "works",
]);

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-_]/g, " ");
}

export function tokenize(text: string): string[] {
  const clean = normalizeText(text);
  return clean.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function countTokenOverlap(tokens: string[], keywordSet: Set<string>): number {
  let count = 0;
  for (const token of tokens) {
    if (keywordSet.has(token)) {
      count += 1;
    }
  }
  return count;
}

export function calcTokenOverlapRatio(
  queryTokens: string[],
  targetTokens: string[],
): number {
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;
  const keywordSet = new Set(targetTokens.map((k) => k.toLowerCase()));
  const matches = countTokenOverlap(queryTokens, keywordSet);
  return matches / Math.max(queryTokens.length, 1);
}

function hasExactPhraseMatch(
  normalizedQuery: string,
  keywords: string[],
): boolean {
  for (const kw of keywords) {
    const lower = kw.toLowerCase().trim();
    if (lower.includes(" ") && normalizedQuery.includes(lower)) {
      return true;
    }
  }
  return false;
}

export function scoreFactMatch(
  normalizedQuery: string,
  queryTokens: string[],
  keywords: string[],
): number {
  const overlap = calcTokenOverlapRatio(queryTokens, keywords);
  const phraseHit = hasExactPhraseMatch(normalizedQuery, keywords) ? 0.65 : 0;
  return Math.min(overlap + phraseHit, 1.0);
}
