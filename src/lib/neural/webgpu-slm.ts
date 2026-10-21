/**
 * Tier 2: On-Device Small Language Model (SLM) Loader & Inference Runtime.
 * Loads SmolLM2-135M-Instruct via verified high-fidelity WASM CPU runtime with WebGPU support.
 * Strictly maintains cyclomatic and cognitive complexity <= 5 across all functions.
 */

import {
  isWebGpuSupported,
  getWebGpuDtype,
  isWebNpuSupported,
} from "./webgpu-support";
import type {
  WebGpuGenerateOptions,
  WebGpuProgress,
  WebGpuProgressListener,
  WebGpuStatus,
} from "./webgpu-types";

const TRANSFORMERS_CDN =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3";
const DEFAULT_MODEL = "HuggingFaceTB/SmolLM2-135M-Instruct";

const SYSTEM_PROMPT =
  "You are ED-AI, Elliot Dickerson's cybernetic AI assistant. Answer user questions directly, concisely, and stay strictly on topic. Do not ramble.";

let pipelineInstance: unknown = null;
let currentStatus: WebGpuStatus = "idle";
let currentProgress = 0;
let progressMessage = "";
type SlmRuntimeDevice = "npu" | "webgpu" | "wasm";
let activeRuntimeDevice: SlmRuntimeDevice = "wasm";
const listeners = new Set<WebGpuProgressListener>();

interface SlmInitOptions {
  allowWasmFallback?: boolean;
}

interface TransformersModule {
  pipeline: (
    task: string,
    model: string,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  TextStreamer: new (
    tokenizer: unknown,
    options: { skip_prompt: boolean; callback_function: (t: string) => void },
  ) => unknown;
}

let testTransformersModule: TransformersModule | null = null;

export function setTransformersModuleForTesting(
  mod: TransformersModule | null,
): void {
  testTransformersModule = mod;
}

export function resetPipelineForTesting(): void {
  pipelineInstance = null;
  currentStatus = "idle";
  currentProgress = 0;
  progressMessage = "";
  activeRuntimeDevice = "wasm";
}

export function getActiveRuntimeDevice(): SlmRuntimeDevice {
  return activeRuntimeDevice;
}

export function getWebGpuStatus(): WebGpuStatus {
  return currentStatus;
}

export function getWebGpuProgress(): WebGpuProgress {
  return {
    status: currentStatus,
    percent: currentProgress,
    message: progressMessage,
  };
}

export function isWebGpuActive(): boolean {
  return pipelineInstance !== null && currentStatus === "ready";
}

export function subscribeWebGpuProgress(
  listener: WebGpuProgressListener,
): () => void {
  listeners.add(listener);
  listener(getWebGpuProgress());
  return () => {
    listeners.delete(listener);
  };
}

function broadcastProgress(
  status: WebGpuStatus,
  percent: number,
  msg: string,
): void {
  currentStatus = status;
  currentProgress = percent;
  progressMessage = msg;
  const state = getWebGpuProgress();
  for (const fn of listeners) {
    fn(state);
  }
}

interface PipelineEvent {
  status?: string;
  progress?: number;
  file?: string;
}

function formatFileProgress(file?: string, progress?: number): string {
  const name = file || "weights";
  const pct = Math.round(progress || 0);
  return `Streaming ${name} (${pct}%)`;
}

function handlePipelineProgress(event: PipelineEvent): void {
  const pct = Math.round(event.progress || 0);
  broadcastProgress(
    "downloading",
    pct,
    formatFileProgress(event.file, event.progress),
  );
}

function handlePipelineEvent(event: PipelineEvent): void {
  if (event.status === "progress") {
    handlePipelineProgress(event);
    return;
  }
  if (event.status === "done") {
    const name = event.file || "model";
    broadcastProgress("downloading", 100, `Cached ${name}`);
  }
}

async function fetchTransformersModule(): Promise<TransformersModule> {
  if (testTransformersModule) return testTransformersModule;
  const mod = (await import(
    /* @vite-ignore */ TRANSFORMERS_CDN
  )) as TransformersModule;
  return mod;
}

function isWasmSupported(): boolean {
  return typeof WebAssembly !== "undefined";
}

async function instantiatePipeline(
  pipelineFn: TransformersModule["pipeline"],
  device: string,
  dtype: string,
): Promise<unknown> {
  return pipelineFn("text-generation", DEFAULT_MODEL, {
    device,
    dtype,
    session_options: {
      logSeverityLevel: 3,
    },
    progress_callback: (e: PipelineEvent) => handlePipelineEvent(e),
  });
}

async function tryNpuBoot(
  pipelineFn: TransformersModule["pipeline"],
): Promise<unknown | null> {
  const npuOk = await isWebNpuSupported();
  if (!npuOk) return null;
  try {
    broadcastProgress(
      "downloading",
      10,
      "Initializing WebNN NPU neural runtime...",
    );
    const inst = await instantiatePipeline(pipelineFn, "webnn-npu", "q4");
    activeRuntimeDevice = "npu";
    return inst;
  } catch {
    return null;
  }
}

async function tryWebGpuBoot(
  pipelineFn: TransformersModule["pipeline"],
): Promise<unknown | null> {
  const gpuOk = await isWebGpuSupported();
  if (!gpuOk) return null;
  try {
    const dtype = await getWebGpuDtype();
    const inst = await instantiatePipeline(pipelineFn, "webgpu", dtype);
    activeRuntimeDevice = "webgpu";
    return inst;
  } catch {
    return null;
  }
}

async function tryWasmBoot(
  pipelineFn: TransformersModule["pipeline"],
): Promise<unknown> {
  if (!isWasmSupported()) {
    throw new Error(
      "Neither WebGPU, NPU, nor WebAssembly is supported in this runtime",
    );
  }
  broadcastProgress(
    "downloading",
    10,
    "Initializing verified WASM CPU runtime...",
  );
  const inst = await instantiatePipeline(pipelineFn, "wasm", "q4");
  activeRuntimeDevice = "wasm";
  return inst;
}

async function bootPipeline(allowWasm: boolean): Promise<unknown> {
  const { pipeline } = await fetchTransformersModule();
  const npuInst = await tryNpuBoot(pipeline);
  if (npuInst) return npuInst;

  if (allowWasm) {
    return tryWasmBoot(pipeline);
  }
  const gpuInst = await tryWebGpuBoot(pipeline);
  if (gpuInst) return gpuInst;
  throw new Error("Neural hardware (NPU/WebGPU) not detected");
}

function resolveFailureStatus(msg: string): WebGpuStatus {
  if (msg.includes("not detected") || msg.includes("not supported")) {
    return "unsupported";
  }
  return "error";
}

async function loadPipelineSafely(allowWasm: boolean): Promise<boolean> {
  try {
    pipelineInstance = await bootPipeline(allowWasm);
    const dev = activeRuntimeDevice.toUpperCase();
    broadcastProgress("ready", 100, `Neural SLM loaded in ${dev} runtime`);
    return true;
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to load neural SLM";
    broadcastProgress(resolveFailureStatus(errorMsg), 0, errorMsg);
    return false;
  }
}

async function checkHardwareSupport(allowWasm: boolean): Promise<boolean> {
  if (allowWasm) return true;
  const npu = await isWebNpuSupported();
  if (npu) return true;
  return isWebGpuSupported();
}

export async function initWebGpuSlm(
  options: SlmInitOptions = {},
): Promise<boolean> {
  if (pipelineInstance) return true;

  const allowWasm = options.allowWasmFallback ?? true;
  const supported = await checkHardwareSupport(allowWasm);
  if (!supported) {
    broadcastProgress("unsupported", 0, "WebGPU hardware not detected");
    return false;
  }

  broadcastProgress("downloading", 5, "Initializing neural SLM runtime...");
  return loadPipelineSafely(allowWasm);
}

interface GeneratorCallable {
  (
    inputs: Array<{ role: string; content: string }>,
    options?: Record<string, unknown>,
  ): Promise<
    Array<{ generated_text: Array<{ role: string; content: string }> }>
  >;
  tokenizer: unknown;
}

function extractFromChatString(text: string): string {
  const marker = "<|im_start|>assistant";
  if (text.includes(marker)) {
    const after = text.split(marker).pop() || "";
    return after.replace(/<\|im_end\|>/g, "").trim();
  }
  return text.trim();
}

function extractLastFromList(list: Array<{ content?: string }>): string {
  if (list.length === 0) return "";
  const item = list[list.length - 1];
  return item && typeof item.content === "string" ? item.content.trim() : "";
}

function getFirstGeneratedText(output: unknown): unknown {
  if (!Array.isArray(output)) return null;
  const first = output[0] as { generated_text?: unknown } | undefined;
  return first ? first.generated_text : null;
}

export function extractLastMessage(output: unknown): string {
  const gen = getFirstGeneratedText(output);
  if (typeof gen === "string") {
    return extractFromChatString(gen);
  }
  if (Array.isArray(gen)) {
    return extractLastFromList(gen);
  }
  return "";
}

function resolveTemperature(options: WebGpuGenerateOptions): number {
  if (options.temperature !== undefined) {
    return options.temperature;
  }
  return options.doSample ? 0.2 : 0;
}

function buildGenOptions(
  options: WebGpuGenerateOptions,
  streamer: unknown,
): Record<string, unknown> {
  const maxTokens = options.maxTokens || 80;
  const doSample = Boolean(options.doSample);
  const temp = resolveTemperature(options);
  return {
    max_new_tokens: maxTokens,
    temperature: temp,
    do_sample: doSample,
    top_p: 0.9,
    repetition_penalty: 1.15,
    streamer,
  };
}

function buildUserPrompt(prompt: string, context?: string): string {
  if (context && context.trim().length > 0) {
    return `Context: ${context.trim()}\n\nQuestion: ${prompt.trim()}\nAnswer:`;
  }
  return prompt.trim();
}

function hasRepetitiveStutter(text: string): boolean {
  return /(.{2,12})\1{4,}/i.test(text);
}

function trimIncompleteSentence(text: string): string {
  const lastPunct = Math.max(
    text.lastIndexOf("."),
    text.lastIndexOf("!"),
    text.lastIndexOf("?"),
  );
  if (lastPunct >= 30) {
    return text.slice(0, lastPunct + 1).trim();
  }
  return text;
}

function cleanGeneratedText(raw: string): string {
  const trimmed = raw.trim();
  if (hasRepetitiveStutter(trimmed)) {
    const match = /(.{2,12})\1{4,}/i.exec(trimmed);
    if (match && match.index > 20) {
      return trimIncompleteSentence(trimmed.slice(0, match.index).trim());
    }
    return "";
  }
  return trimIncompleteSentence(trimmed);
}

export async function generateWebGpuResponse(
  prompt: string,
  options: WebGpuGenerateOptions = {},
): Promise<string> {
  if (!pipelineInstance) {
    throw new Error("WebGPU model not initialized");
  }

  broadcastProgress(
    "generating",
    100,
    "Inferencing on local neural runtime...",
  );
  const generator = pipelineInstance as GeneratorCallable;
  const userContent = buildUserPrompt(prompt, options.context);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];

  try {
    const { TextStreamer } = await fetchTransformersModule();
    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      callback_function: (token: string) => {
        options.onToken?.(token);
      },
    });

    const genOpts = buildGenOptions(options, streamer);
    const output = await generator(messages, genOpts);
    const raw = extractLastMessage(output);
    return cleanGeneratedText(raw);
  } finally {
    broadcastProgress("ready", 100, "Neural SLM ready");
  }
}
