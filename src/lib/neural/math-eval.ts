/**
 * Client-Side Instant Math & Arithmetic Evaluator.
 * Evaluates queries like "what is two plus two?", "2 + 2", "10 * 5" in 0ms.
 * All functions strictly maintain cyclomatic & cognitive complexity <= 5.
 */

const WORD_TO_NUM: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  thre: 3,
  four: 4,
  for: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twewlve: 12,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

export function parseWordNumber(word: string): number | null {
  const w = word.toLowerCase().trim();
  if (WORD_TO_NUM[w] !== undefined) return WORD_TO_NUM[w];
  const num = Number(w);
  return Number.isNaN(num) ? null : num;
}

export function cleanMathQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/^(can\s+you\s+)?(please\s+)?(tell\s+me|find|give\s+me)?\s*/i, "")
    .replace(
      /^(what\s*('?s|is)(\s+the)?|how\s+much\s+is|calculate|calc|solve|compute|eval)\s+/i,
      "",
    )
    .replace(/^the\s+/i, "")
    .replace(/[?!.]/g, "")
    .trim();
}

type OpHandler = (a: number, b: number) => string;

const OP_HANDLERS: Record<string, OpHandler> = {
  plus: (a, b) => `${a} + ${b} = ${a + b}`,
  plsu: (a, b) => `${a} + ${b} = ${a + b}`,
  puls: (a, b) => `${a} + ${b} = ${a + b}`,
  pls: (a, b) => `${a} + ${b} = ${a + b}`,
  plu: (a, b) => `${a} + ${b} = ${a + b}`,
  "+": (a, b) => `${a} + ${b} = ${a + b}`,
  add: (a, b) => `${a} + ${b} = ${a + b}`,
  "added to": (a, b) => `${a} + ${b} = ${a + b}`,
  and: (a, b) => `${a} + ${b} = ${a + b}`,

  minus: (a, b) => `${a} - ${b} = ${a - b}`,
  mnus: (a, b) => `${a} - ${b} = ${a - b}`,
  minu: (a, b) => `${a} - ${b} = ${a - b}`,
  "-": (a, b) => `${a} - ${b} = ${a - b}`,
  subtract: (a, b) => `${a} - ${b} = ${a - b}`,
  "subtracted by": (a, b) => `${a} - ${b} = ${a - b}`,
  less: (a, b) => `${a} - ${b} = ${a - b}`,

  times: (a, b) => `${a} × ${b} = ${a * b}`,
  tims: (a, b) => `${a} × ${b} = ${a * b}`,
  time: (a, b) => `${a} × ${b} = ${a * b}`,
  "*": (a, b) => `${a} × ${b} = ${a * b}`,
  x: (a, b) => `${a} × ${b} = ${a * b}`,
  multiply: (a, b) => `${a} × ${b} = ${a * b}`,
  "multiplied by": (a, b) => `${a} × ${b} = ${a * b}`,

  "divided by": (a, b) =>
    b === 0 ? "Division by zero is undefined." : `${a} ÷ ${b} = ${a / b}`,
  "divide by": (a, b) =>
    b === 0 ? "Division by zero is undefined." : `${a} ÷ ${b} = ${a / b}`,
  over: (a, b) =>
    b === 0 ? "Division by zero is undefined." : `${a} ÷ ${b} = ${a / b}`,
  "/": (a, b) =>
    b === 0 ? "Division by zero is undefined." : `${a} ÷ ${b} = ${a / b}`,

  "^": (a, b) => `${a} ^ ${b} = ${a ** b}`,
  "**": (a, b) => `${a} ** ${b} = ${a ** b}`,
  "to the power of": (a, b) => `${a} ^ ${b} = ${a ** b}`,
  "%": (a, b) =>
    b === 0 ? "Modulo by zero is undefined." : `${a} % ${b} = ${a % b}`,
  mod: (a, b) =>
    b === 0 ? "Modulo by zero is undefined." : `${a} % ${b} = ${a % b}`,
  modulo: (a, b) =>
    b === 0 ? "Modulo by zero is undefined." : `${a} % ${b} = ${a % b}`,
};

function evaluateOp(n1: number, op: string, n2: number): string | null {
  const handler = OP_HANDLERS[op];
  if (!handler) return null;
  return handler(n1, n2);
}

const OPERATOR_PATTERN =
  "plus|plsu|puls|pls|plu|\\+|add|added\\s+to|and|minus|mnus|minu|-|subtract|subtracted\\s+by|less|times|tims|time|\\*|x|multiply|multiplied\\s+by|divided\\s+by|divide\\s+by|over|\\/|\\^|\\*\\*|to\\s+the\\s+power\\s+of|%|mod|modulo";

const MATH_REGEX = new RegExp(
  `^([-+]?[a-z0-9.]+)\\s*(${OPERATOR_PATTERN})\\s*([-+]?[a-z0-9.]+)$`,
  "i",
);

interface PrefixRule {
  regex: RegExp;
  op: string;
}

const PREFIX_RULES: PrefixRule[] = [
  {
    regex: /^(?:sum|total)\s+of\s+([a-z0-9.]+)\s+(?:and|\+|,)\s+([a-z0-9.]+)$/i,
    op: "plus",
  },
  {
    regex: /^add\s+([a-z0-9.]+)\s+(?:and|to|\+|,)\s+([a-z0-9.]+)$/i,
    op: "plus",
  },
  {
    regex: /^difference\s+(?:of|between)\s+([a-z0-9.]+)\s+and\s+([a-z0-9.]+)$/i,
    op: "minus",
  },
  {
    regex:
      /^(?:product\s+of|multiply)\s+([a-z0-9.]+)\s+(?:and|by|\*|x|,)\s+([a-z0-9.]+)$/i,
    op: "times",
  },
  {
    regex:
      /^(?:quotient\s+of|divide)\s+([a-z0-9.]+)\s+(?:and|by|\/|,)\s+([a-z0-9.]+)$/i,
    op: "divided by",
  },
];

const SUBTRACT_FROM_REGEX = /^subtract\s+([a-z0-9.]+)\s+from\s+([a-z0-9.]+)$/i;

function tryApplyPrefixRule(clean: string, rule: PrefixRule): string | null {
  const match = clean.match(rule.regex);
  if (!match) return null;
  const n1 = parseWordNumber(match[1]);
  const n2 = parseWordNumber(match[2]);
  if (n1 === null || n2 === null) return null;
  return evaluateOp(n1, rule.op, n2);
}

function matchPrefixRule(clean: string): string | null {
  for (const rule of PREFIX_RULES) {
    const res = tryApplyPrefixRule(clean, rule);
    if (res) return res;
  }
  return null;
}

function matchSubtractFrom(clean: string): string | null {
  const match = clean.match(SUBTRACT_FROM_REGEX);
  if (!match) return null;
  const n1 = parseWordNumber(match[1]);
  const n2 = parseWordNumber(match[2]);
  if (n1 === null || n2 === null) return null;
  return evaluateOp(n2, "minus", n1);
}

function matchInfixMath(clean: string): string | null {
  const match = clean.match(MATH_REGEX);
  if (!match) return null;

  const n1 = parseWordNumber(match[1]);
  const op = match[2].trim().toLowerCase();
  const n2 = parseWordNumber(match[3]);

  if (n1 === null || n2 === null) return null;
  return evaluateOp(n1, op, n2);
}

export function solveSimpleMath(query: string): string | null {
  const clean = cleanMathQuery(query);
  const infix = matchInfixMath(clean);
  if (infix) return infix;

  const prefix = matchPrefixRule(clean);
  if (prefix) return prefix;

  return matchSubtractFrom(clean);
}

const TIME_REGEX = /^(what\s+)?(the\s+)?time(\s+is\s+it)?$|^current\s+time$/i;
const DATE_REGEX =
  /^(what\s+)?(the\s+)?(date|day)(\s+(today|is\s+it(\s+today)?|is\s+today))?$|^today'?s\s+(date|day)$/i;
const YEAR_REGEX = /^(what\s+)?(the\s+)?year(\s+is\s+it)?$|^current\s+year$/i;

function formatTemporalDate(now: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-GB", options);
}

function solveTimeQuery(clean: string, now: Date): string | null {
  if (!TIME_REGEX.test(clean)) return null;
  return `Current system time is ${now.toLocaleTimeString("en-GB")}. Chronometer online.`;
}

function solveDateOrYearQuery(clean: string, now: Date): string | null {
  if (DATE_REGEX.test(clean)) {
    return `Current date is ${formatTemporalDate(now)}. Timeline synchronized.`;
  }
  if (YEAR_REGEX.test(clean)) {
    return `Current year is ${now.getFullYear()}. Chronometer nominal.`;
  }
  return null;
}

export function solveTemporalQuery(query: string): string | null {
  const clean = cleanMathQuery(query);
  const now = new Date();
  const timeRes = solveTimeQuery(clean, now);
  if (timeRes) return timeRes;
  return solveDateOrYearQuery(clean, now);
}
