/**
 * WebGPU Hardware Detection & Capability Inspection.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

export async function isWebGpuSupported(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as unknown as {
    gpu?: { requestAdapter: () => Promise<unknown> };
  };
  if (!nav.gpu) return false;

  try {
    const adapter = await nav.gpu.requestAdapter();
    return Boolean(adapter);
  } catch {
    return false;
  }
}

/**
 * Standardize on 'q4' quantization.
 * 'q4f16' triggers "A float16 tensor's data must be type of function Float16Array()"
 * in browsers where native Float16Array is unsupported or mismatched with ONNX Runtime Web.
 */
export async function getWebGpuDtype(): Promise<string> {
  return "q4";
}

/**
 * WebNN NPU Hardware Detection via navigator.ml.
 * Detects whether dedicated Neural Processing Unit acceleration is available.
 */
export async function isWebNpuSupported(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as unknown as {
    ml?: {
      createContext?: (options?: { deviceType?: string }) => Promise<unknown>;
    };
  };
  if (!nav.ml?.createContext) return false;

  try {
    const context = await nav.ml.createContext({ deviceType: "npu" });
    return Boolean(context);
  } catch {
    return false;
  }
}
