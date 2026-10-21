/**
 * Intent Classification and Semantic Fact Resolution.
 * Strictly maintains cyclomatic & cognitive complexity <= 5.
 */

import { NEURAL_FACTS } from "./knowledge";
import { normalizeText, scoreFactMatch, tokenize } from "./similarity";
import type { NeuralCategory, NeuralFact } from "./types";

interface BestMatchResult {
  bestFact: NeuralFact | null;
  bestScore: number;
}

const GREETINGS = new Set([
  "hello",
  "hi",
  "hey",
  "greetings",
  "yo",
  "sup",
  "morning",
  "evening",
]);

export function isGreeting(tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  return tokens.length <= 2 && GREETINGS.has(tokens[0]);
}

function evaluateFacts(
  normalizedQuery: string,
  tokens: string[],
): BestMatchResult {
  let bestFact: NeuralFact | null = null;
  let bestScore = 0;

  for (const fact of NEURAL_FACTS) {
    const score = scoreFactMatch(normalizedQuery, tokens, fact.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestFact = fact;
    }
  }

  return { bestFact, bestScore };
}

export function resolveFactForQuery(query: string): {
  fact: NeuralFact | null;
  score: number;
  category: NeuralCategory;
} {
  const norm = normalizeText(query);
  const tokens = tokenize(query);

  if (isGreeting(tokens)) {
    const identityFact =
      NEURAL_FACTS.find((f) => f.id === "ai-self-identity") ?? null;
    return { fact: identityFact, score: 0.95, category: "identity" };
  }

  const { bestFact, bestScore } = evaluateFacts(norm, tokens);

  if (bestFact && bestScore >= 0.35) {
    return { fact: bestFact, score: bestScore, category: bestFact.category };
  }

  return { fact: null, score: bestScore, category: "identity" };
}

const ELLIOT_TERMS = ["elliot", "dickerson", "author", "creator"];

function matchesElliotReference(query: string): boolean {
  const norm = query.toLowerCase();
  for (const term of ELLIOT_TERMS) {
    if (norm.includes(term)) return true;
  }
  return false;
}

const DEFAULT_BIO_CONTEXT =
  "Elliot Dickerson is a Senior Web Developer with 14+ years experience at RM Assessments, specializing in PHP, Laravel, SolidJS, SQL, and WCAG accessibility.";

export function findRelevantContext(query: string): string {
  const norm = normalizeText(query);
  const tokens = tokenize(query);
  const { bestFact, bestScore } = evaluateFacts(norm, tokens);

  if (bestFact && bestScore >= 0.45) {
    return bestFact.summary;
  }
  if (matchesElliotReference(query)) {
    return DEFAULT_BIO_CONTEXT;
  }
  return "";
}
