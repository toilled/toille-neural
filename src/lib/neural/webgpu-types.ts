/**
 * WebGPU Small Language Model (Tier 2) Type Definitions.
 */

export type WebGpuStatus =
  "unsupported" | "idle" | "downloading" | "ready" | "generating" | "error";

export interface WebGpuProgress {
  status: WebGpuStatus;
  percent: number;
  message: string;
}

export type WebGpuProgressListener = (progress: WebGpuProgress) => void;

export interface WebGpuGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  doSample?: boolean;
  context?: string;
  onToken?: (token: string) => void;
}
