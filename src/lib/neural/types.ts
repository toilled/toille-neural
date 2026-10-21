/**
 * On-Device Neuromorphic Brain ("ED-AI") Data Types & Interfaces.
 */

export type NeuralState =
  "idle" | "listening" | "inferencing" | "speaking" | "executing";

export type NeuralCategory =
  | "identity"
  | "experience"
  | "skills"
  | "projects"
  | "music"
  | "philosophy"
  | "system";

export interface NeuralDirective {
  type:
    | "theme"
    | "eco"
    | "navigate"
    | "racer"
    | "audio"
    | "benchmark"
    | "matrix"
    | "briefing"
    | "telemetry";
  param?: string;
  label: string;
}

export interface NeuralFact {
  id: string;
  category: NeuralCategory;
  keywords: string[];
  summary: string;
  detailed: string;
  directive?: NeuralDirective;
  quickFollowUps?: string[];
}

export interface NeuralQueryOptions {
  speakResponse?: boolean;
  executeDirectives?: boolean;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface NeuralResponse {
  query: string;
  factId?: string;
  category: NeuralCategory;
  text: string;
  confidence: number;
  directive?: NeuralDirective;
  followUps: string[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  directive?: NeuralDirective;
  followUps?: string[];
  timestamp: number;
  isStreaming?: boolean;
}
