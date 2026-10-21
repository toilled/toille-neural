/**
 * On-Device Neuromorphic Brain Core Engine ("ED-AI").
 * Manages semantic retrieval, response synthesis, directives execution, and state broadcast.
 * Strictly maintains cyclomatic & cognitive complexity <= 5 across all functions.
 */

import { resolveFactForQuery, findRelevantContext } from "./intent";
import { executeDirective } from "./directives";
import { synthesizeVoiceResponse } from "./voice-bridge";
import { SUGGESTED_QUERIES } from "./knowledge";
import {
  isWebGpuActive,
  getWebGpuStatus,
  getWebGpuProgress,
  generateWebGpuResponse,
} from "./webgpu-slm";
import { solveSimpleMath, solveTemporalQuery } from "./math-eval";
import type {
  NeuralDirective,
  NeuralFact,
  NeuralQueryOptions,
  NeuralResponse,
} from "./types";

function buildFallbackResponse(query: string): NeuralResponse {
  return {
    query,
    category: "identity",
    confidence: 0,
    text: '// ED-AI NEURAL CORE [UNMAPPED PATTERN]\nQuery unmapped in local neural matrix. I can brief you on Elliot\'s 14+ years career, RM Assessments architecture, PHP/SQL/SolidJS stack, CyberRacer engine, Cyberdeck synth, or execute system controls.\n\nTip: Click "⚡ ENGAGE WEBGPU" in the top-right header to activate open-ended on-device generative reasoning.',
    followUps: SUGGESTED_QUERIES.slice(0, 3),
    timestamp: Date.now(),
  };
}

function buildFactResponse(
  query: string,
  fact: NeuralFact,
  confidence: number,
): NeuralResponse {
  const followUps = fact.quickFollowUps ?? SUGGESTED_QUERIES.slice(0, 3);
  const text = `// ED-AI NEURAL CORE [MATCH: ${fact.id.toUpperCase()}]\n${fact.detailed}`;

  return {
    query,
    factId: fact.id,
    category: fact.category,
    confidence,
    text,
    directive: fact.directive,
    followUps,
    timestamp: Date.now(),
  };
}

function buildSystemEvalResponse(
  query: string,
  systemTag: string,
  content: string,
): NeuralResponse {
  return {
    query,
    category: "system",
    confidence: 1.0,
    text: `// ED-AI NEURAL CORE [${systemTag}]\n${content}`,
    followUps: SUGGESTED_QUERIES.slice(0, 3),
    timestamp: Date.now(),
  };
}

function buildSlmResponse(query: string, text: string): NeuralResponse {
  return {
    query,
    category: "identity",
    confidence: 0.99,
    text: `// ED-AI NEURAL CORE [GENERATIVE SLM]\n${text}`,
    followUps: SUGGESTED_QUERIES.slice(0, 3),
    timestamp: Date.now(),
  };
}

function buildSlmErrorResponse(query: string, err: unknown): NeuralResponse {
  const msg = err instanceof Error ? err.message : "Generative model error";
  return {
    query,
    category: "system",
    confidence: 0.5,
    text: `// ED-AI NEURAL CORE [SLM INFERENCE ERROR]\nOn-device inference error: ${msg}.\nYou can ask me about Elliot's career, RM Assessments architecture, CyberRacer engine, or issue system controls.`,
    followUps: SUGGESTED_QUERIES.slice(0, 3),
    timestamp: Date.now(),
  };
}

function checkDownloadingStatus(query: string): NeuralResponse | null {
  if (getWebGpuStatus() !== "downloading") return null;
  const pct = getWebGpuProgress().percent;
  return {
    query,
    category: "system",
    confidence: 0.8,
    text: `// ED-AI NEURAL CORE [SLM DOWNLOADING]\nThe on-device language model is currently streaming weights into local memory (${pct}% complete). Please wait a moment for the model to finish loading!`,
    followUps: SUGGESTED_QUERIES.slice(0, 3),
    timestamp: Date.now(),
  };
}

function notifyStateChange(state: string, query?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("neural:state:change", {
      detail: { state, query },
    }),
  );
}

function handleDirectiveExecution(
  directive: NeuralDirective | undefined,
  shouldExecute: boolean,
): void {
  if (!directive || !shouldExecute) return;
  void executeDirective(directive);
}

function handleVocalSynthesis(
  response: NeuralResponse,
  shouldSpeak: boolean,
): void {
  if (!shouldSpeak) return;
  synthesizeVoiceResponse(response);
}

async function tryWebGpuInference(
  query: string,
): Promise<NeuralResponse | null> {
  const downloading = checkDownloadingStatus(query);
  if (downloading) return downloading;
  if (!isWebGpuActive()) return null;

  try {
    const context = findRelevantContext(query);
    const text = await generateWebGpuResponse(query, { context });
    if (!text) return null;
    return buildSlmResponse(query, text);
  } catch (err) {
    return buildSlmErrorResponse(query, err);
  }
}

function tryEvaluateImmediate(query: string): NeuralResponse | null {
  const math = solveSimpleMath(query);
  if (math) return buildSystemEvalResponse(query, "ARITHMETIC ENGINE", math);
  const temporal = solveTemporalQuery(query);
  if (temporal)
    return buildSystemEvalResponse(query, "TEMPORAL CHRONOMETER", temporal);
  return null;
}

function tryMatchFact(
  query: string,
  fact: NeuralFact | null,
  score: number,
): NeuralResponse | null {
  if (!fact || score < 0.35) return null;
  return buildFactResponse(query, fact, score);
}

function tryHighConfidenceFact(
  query: string,
  fact: NeuralFact | null,
  score: number,
): NeuralResponse | null {
  if (!fact) return null;
  if (score >= 0.7 || fact.category === "system") {
    return buildFactResponse(query, fact, score);
  }
  return null;
}

async function resolveActiveSlmResponse(
  query: string,
  fact: NeuralFact | null,
  score: number,
): Promise<NeuralResponse | null> {
  const highConf = tryHighConfidenceFact(query, fact, score);
  if (highConf) return highConf;
  return tryWebGpuInference(query);
}

async function resolveStandardResponse(
  query: string,
  fact: NeuralFact | null,
  score: number,
): Promise<NeuralResponse> {
  const factResp = tryMatchFact(query, fact, score);
  if (factResp) return factResp;
  const webGpuResp = await tryWebGpuInference(query);
  if (webGpuResp) return webGpuResp;
  return buildFallbackResponse(query);
}

async function resolveResponse(
  query: string,
  fact: NeuralFact | null,
  score: number,
): Promise<NeuralResponse> {
  const immediate = tryEvaluateImmediate(query);
  if (immediate) return immediate;

  if (isWebGpuActive()) {
    const slmResp = await resolveActiveSlmResponse(query, fact, score);
    if (slmResp) return slmResp;
  }

  return resolveStandardResponse(query, fact, score);
}

export async function askNeuralBrain(
  query: string,
  options: NeuralQueryOptions = {},
): Promise<NeuralResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return buildFallbackResponse("");
  }

  notifyStateChange("inferencing", trimmed);

  const { fact, score } = resolveFactForQuery(trimmed);
  const response = await resolveResponse(trimmed, fact, score);

  notifyStateChange("executing", trimmed);
  handleDirectiveExecution(
    response.directive,
    Boolean(options.executeDirectives),
  );
  handleVocalSynthesis(response, Boolean(options.speakResponse));

  notifyStateChange("idle", trimmed);
  return response;
}
