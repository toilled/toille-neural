import { describe, it, expect, vi, beforeEach } from "vitest";
import { askNeuralBrain } from "$lib/neural/engine";
import {
  normalizeText,
  tokenize,
  calcTokenOverlapRatio,
  scoreFactMatch,
} from "$lib/neural/similarity";
import {
  isGreeting,
  resolveFactForQuery,
  findRelevantContext,
} from "$lib/neural/intent";
import { executeDirective } from "$lib/neural/directives";
import {
  solveSimpleMath,
  solveTemporalQuery,
  parseWordNumber,
  cleanMathQuery,
} from "$lib/neural/math-eval";

describe("Neural Engine & Similarity Math", () => {
  it("normalizes text and strips punctuation", () => {
    expect(normalizeText("Hello, World! 123")).toBe("hello  world  123");
  });

  it("tokenizes and removes stop words", () => {
    const tokens = tokenize("tell me about the php experience please");
    expect(tokens).toContain("php");
    expect(tokens).toContain("experience");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("me");
  });

  it("calculates token overlap ratio correctly", () => {
    expect(calcTokenOverlapRatio([], ["php"])).toBe(0);
    expect(calcTokenOverlapRatio(["php", "laravel"], ["php", "sql"])).toBe(0.5);
  });

  it("scores fact match with phrase bonus", () => {
    const score = scoreFactMatch(
      "tell me about dark mode",
      ["dark", "mode"],
      ["dark mode"],
    );
    expect(score).toBeGreaterThan(0.5);
  });
});

describe("Neural Intent Resolution", () => {
  it("detects conversational greetings", () => {
    expect(isGreeting(["hello"])).toBe(true);
    expect(isGreeting(["hey"])).toBe(true);
    expect(isGreeting(["explain", "database"])).toBe(false);
  });

  it("resolves greetings to self-identity fact", () => {
    const res = resolveFactForQuery("hello");
    expect(res.fact?.id).toBe("ai-self-identity");
    expect(res.score).toBeGreaterThan(0.9);
  });

  it("resolves RM Assessments queries accurately", () => {
    const res = resolveFactForQuery("What does Elliot do at RM Assessments?");
    expect(res.fact?.id).toBe("exp-rm-assessments");
    expect(res.category).toBe("experience");
  });

  it("resolves CyberRacer queries accurately", () => {
    const res = resolveFactForQuery("Tell me about CyberRacer physics");
    expect(res.fact?.id).toBe("proj-cyberracer");
    expect(res.category).toBe("projects");
  });

  it("resolves Cyberdeck audio queries accurately", () => {
    const res = resolveFactForQuery("How does the Cyberdeck synthesizer work?");
    expect(res.fact?.id).toBe("proj-cyberdeck");
    expect(res.category).toBe("projects");
  });

  it("resolves backend SQL queries accurately", () => {
    const res = resolveFactForQuery("Tell me about his PHP and SQL experience");
    expect(res.fact?.id).toBe("skills-backend-sql");
    expect(res.category).toBe("skills");
  });

  it('resolves "What can you do?" to capabilities fact accurately', () => {
    const res = resolveFactForQuery("What can you do?");
    expect(res.fact?.id).toBe("ai-capabilities");
    expect(res.score).toBeGreaterThan(0.5);
  });

  it("returns fallback for unmapped nonsense", () => {
    const res = resolveFactForQuery("xyzqwerty123456");
    expect(res.fact).toBeNull();
  });

  it("does not resolve generic CS questions like A* to RM Assessments", () => {
    const res = resolveFactForQuery("How does the A* path finding work?");
    expect(res.fact?.id).toBeUndefined();
  });

  it("finds relevant context for matched facts", () => {
    const ctx = findRelevantContext("Tell me about RM Assessments platform");
    expect(ctx).toContain("RM Assessments");
  });

  it("finds default bio context when referencing Elliot", () => {
    const ctx = findRelevantContext("What kind of developer is Elliot?");
    expect(ctx).toContain("Elliot Dickerson");
  });

  it("returns empty context for unrelated nonsense", () => {
    const ctx = findRelevantContext("xyzqwerty123456");
    expect(ctx).toBe("");
  });
});

describe("Instant Math & Temporal Evaluator", () => {
  it("parses number words and numeric strings", () => {
    expect(parseWordNumber("two")).toBe(2);
    expect(parseWordNumber("twelve")).toBe(12);
    expect(parseWordNumber("42")).toBe(42);
    expect(parseWordNumber("unknown")).toBeNull();
  });

  it("cleans math queries of conversational wrappers", () => {
    expect(cleanMathQuery("What is two plus two?")).toBe("two plus two");
    expect(cleanMathQuery("What's 10 * 5?")).toBe("10 * 5");
    expect(cleanMathQuery("Calculate 100 / 4")).toBe("100 / 4");
    expect(cleanMathQuery("please solve 5 + 3")).toBe("5 + 3");
  });

  it("solves simple math operations accurately in words and numbers", () => {
    expect(solveSimpleMath("What is two plus two?")).toBe("2 + 2 = 4");
    expect(solveSimpleMath("What is the sum of four and three?")).toBe(
      "4 + 3 = 7",
    );
    expect(solveSimpleMath("What is three plsu two?")).toBe("3 + 2 = 5");
    expect(solveSimpleMath("difference between ten and four")).toBe(
      "10 - 4 = 6",
    );
    expect(solveSimpleMath("product of six and seven")).toBe("6 × 7 = 42");
    expect(solveSimpleMath("quotient of twenty and four")).toBe("20 ÷ 4 = 5");
    expect(solveSimpleMath("subtract three from ten")).toBe("10 - 3 = 7");
    expect(solveSimpleMath("add four and three")).toBe("4 + 3 = 7");
    expect(solveSimpleMath("2 + 2")).toBe("2 + 2 = 4");
    expect(solveSimpleMath("10 minus 3")).toBe("10 - 3 = 7");
    expect(solveSimpleMath("15 subtracted by 5")).toBe("15 - 5 = 10");
    expect(solveSimpleMath("8 less 3")).toBe("8 - 3 = 5");
    expect(solveSimpleMath("5 added to 10")).toBe("5 + 10 = 15");
    expect(solveSimpleMath("12 multiplied by 3")).toBe("12 × 3 = 36");
    expect(solveSimpleMath("10 over 2")).toBe("10 ÷ 2 = 5");
    expect(solveSimpleMath("divide 20 by 5")).toBe("20 ÷ 5 = 4");
    expect(solveSimpleMath("difference of 15 and 5")).toBe("15 - 5 = 10");
    expect(solveSimpleMath("6 * 7")).toBe("6 × 7 = 42");
    expect(solveSimpleMath("20 divided by 4")).toBe("20 ÷ 4 = 5");
    expect(solveSimpleMath("5 / 0")).toBe("Division by zero is undefined.");
    expect(solveSimpleMath("2 ^ 3")).toBe("2 ^ 3 = 8");
    expect(solveSimpleMath("2 ** 4")).toBe("2 ** 4 = 16");
    expect(solveSimpleMath("3 to the power of 2")).toBe("3 ^ 2 = 9");
    expect(solveSimpleMath("10 % 3")).toBe("10 % 3 = 1");
    expect(solveSimpleMath("14 mod 5")).toBe("14 % 5 = 4");
    expect(solveSimpleMath("20 modulo 7")).toBe("20 % 7 = 6");
    expect(solveSimpleMath("10 % 0")).toBe("Modulo by zero is undefined.");
    expect(solveSimpleMath("-5 + 10")).toBe("-5 + 10 = 5");
    expect(solveSimpleMath("5 - -3")).toBe("5 - -3 = 8");
    expect(parseWordNumber("unknown_word")).toBeNull();
    expect(cleanMathQuery("can you please tell me what is 2 + 2?")).toBe(
      "2 + 2",
    );
  });

  it("returns null for non-math queries", () => {
    expect(solveSimpleMath("Tell me about Elliot")).toBeNull();
    expect(solveSimpleMath("Who are you?")).toBeNull();
  });

  it("solves temporal queries (time, date, year)", () => {
    expect(solveTemporalQuery("What time is it?")).toContain(
      "Current system time",
    );
    expect(solveTemporalQuery("What is the date today?")).toContain(
      "Current date",
    );
    expect(solveTemporalQuery("What year is it?")).toContain("Current year");
    expect(solveTemporalQuery("What is your name?")).toBeNull();
  });
});

describe("askNeuralBrain End-to-End", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles empty query gracefully with fallback", async () => {
    const res = await askNeuralBrain("");
    expect(res.text).toContain("UNMAPPED");
    expect(res.confidence).toBe(0);
  });

  it('evaluates "What is two plus two?" in 0ms with 100% confidence', async () => {
    const res = await askNeuralBrain("What is two plus two?");
    expect(res.text).toContain("ARITHMETIC ENGINE");
    expect(res.text).toContain("2 + 2 = 4");
    expect(res.confidence).toBe(1.0);
    expect(res.category).toBe("system");
  });

  it('evaluates "What is the sum of four and three?" in 0ms with 100% confidence', async () => {
    const res = await askNeuralBrain("What is the sum of four and three?");
    expect(res.text).toContain("ARITHMETIC ENGINE");
    expect(res.text).toContain("4 + 3 = 7");
    expect(res.confidence).toBe(1.0);
    expect(res.category).toBe("system");
  });

  it('evaluates "What is three plsu two?" with typo tolerance', async () => {
    const res = await askNeuralBrain("What is three plsu two?");
    expect(res.text).toContain("ARITHMETIC ENGINE");
    expect(res.text).toContain("3 + 2 = 5");
    expect(res.confidence).toBe(1.0);
  });

  it('evaluates simple math expressions like "10 * 5"', async () => {
    const res = await askNeuralBrain("10 * 5");
    expect(res.text).toContain("10 × 5 = 50");
    expect(res.confidence).toBe(1.0);
  });

  it('evaluates temporal query "What time is it?" instantly', async () => {
    const res = await askNeuralBrain("What time is it?");
    expect(res.text).toContain("TEMPORAL CHRONOMETER");
    expect(res.text).toContain("Current system time");
    expect(res.confidence).toBe(1.0);
  });

  it("answers career questions with rich data and followups", async () => {
    const res = await askNeuralBrain("What is Elliot Dickerson background?");
    expect(res.text).toContain("Elliot Dickerson");
    expect(res.followUps.length).toBeGreaterThan(0);
    expect(res.confidence).toBeGreaterThan(0.2);
  });

  it('answers "What can you do?" with comprehensive capabilities', async () => {
    const res = await askNeuralBrain("What can you do?");
    expect(res.text).toContain("Career Briefings");
    expect(res.text).toContain("RM Assessments");
    expect(res.text).toContain("CyberRacer");
    expect(res.confidence).toBeGreaterThan(0.5);
  });

  it("handles system directive execution", async () => {
    const directiveRes = await executeDirective({
      type: "theme",
      param: "dark",
      label: "Engage Dark Mode",
    });
    expect(directiveRes).toBe(true);
  });

  it("does not answer generic CS questions with RM Assessments job bio", async () => {
    const res = await askNeuralBrain("How does the A* path finding work?");
    expect(res.text).toContain("[UNMAPPED PATTERN]");
    expect(res.factId).toBeUndefined();
  });

  it("delegates open-ended questions like A* pathfinding to active SLM without injected job context", async () => {
    const {
      setTransformersModuleForTesting,
      resetPipelineForTesting,
      initWebGpuSlm,
    } = await import("$lib/neural/webgpu-slm");

    resetPipelineForTesting();
    let receivedPrompt = "";
    const mockGenerator = vi.fn().mockImplementation((prompt) => {
      receivedPrompt = prompt;
      return Promise.resolve([
        {
          generated_text: "A* is a graph traversal and path search algorithm.",
        },
      ]);
    });

    setTransformersModuleForTesting({
      pipeline: vi.fn().mockResolvedValue(mockGenerator),
      TextStreamer: class {} as unknown as any,
    });

    await initWebGpuSlm({ allowWasmFallback: true });

    const res = await askNeuralBrain("How does the A* path finding work?");
    expect(res.text).toContain(
      "A* is a graph traversal and path search algorithm.",
    );
    expect(receivedPrompt).not.toContain("RM Assessments");

    setTransformersModuleForTesting(null);
    resetPipelineForTesting();
  });
});

describe("WebGPU Support Detection", () => {
  it("returns false when navigator.gpu is absent", async () => {
    const { isWebGpuSupported } = await import("$lib/neural/webgpu-support");
    const originalNavigator = global.navigator;
    delete (global as Record<string, unknown>).navigator;
    expect(await isWebGpuSupported()).toBe(false);
    global.navigator = originalNavigator;
  });

  it("returns true when adapter is successfully acquired", async () => {
    const { isWebGpuSupported } = await import("$lib/neural/webgpu-support");
    const mockRequestAdapter = vi.fn().mockResolvedValue({ name: "mock-gpu" });
    const originalNavigator = global.navigator;
    (global as Record<string, unknown>).navigator = {
      gpu: { requestAdapter: mockRequestAdapter },
    };

    const supported = await isWebGpuSupported();
    expect(supported).toBe(true);
    expect(mockRequestAdapter).toHaveBeenCalledTimes(1);
    global.navigator = originalNavigator;
  });

  it("returns false when requestAdapter throws", async () => {
    const { isWebGpuSupported } = await import("$lib/neural/webgpu-support");
    const originalNavigator = global.navigator;
    (global as Record<string, unknown>).navigator = {
      gpu: {
        requestAdapter: vi.fn().mockRejectedValue(new Error("GPU disabled")),
      },
    };

    const supported = await isWebGpuSupported();
    expect(supported).toBe(false);
    global.navigator = originalNavigator;
  });

  it("standardizes on q4 for reliable cross-browser quantization", async () => {
    const { getWebGpuDtype } = await import("$lib/neural/webgpu-support");
    const dtype = await getWebGpuDtype();
    expect(dtype).toBe("q4");
  });

  it("detects WebNN NPU support accurately", async () => {
    const { isWebNpuSupported } = await import("$lib/neural/webgpu-support");
    const originalNavigator = global.navigator;

    (global as Record<string, unknown>).navigator = {};
    expect(await isWebNpuSupported()).toBe(false);

    (global as Record<string, unknown>).navigator = {
      ml: {
        createContext: vi.fn().mockResolvedValue({ deviceType: "npu" }),
      },
    };
    expect(await isWebNpuSupported()).toBe(true);

    (global as Record<string, unknown>).navigator = {
      ml: {
        createContext: vi.fn().mockRejectedValue(new Error("No NPU available")),
      },
    };
    expect(await isWebNpuSupported()).toBe(false);

    global.navigator = originalNavigator;
  });
});

describe("WebGPU & WASM SLM Runtime", () => {
  it("initializes in idle state with 0% progress", async () => {
    const {
      getWebGpuStatus,
      getWebGpuProgress,
      isWebGpuActive,
      resetPipelineForTesting,
    } = await import("$lib/neural/webgpu-slm");
    resetPipelineForTesting();
    expect(getWebGpuStatus()).toBe("idle");
    expect(getWebGpuProgress().percent).toBe(0);
    expect(isWebGpuActive()).toBe(false);
  });

  it("notifies subscribers on subscription", async () => {
    const { subscribeWebGpuProgress } = await import("$lib/neural/webgpu-slm");
    const listener = vi.fn();
    const unsubscribe = subscribeWebGpuProgress(listener);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "idle",
        percent: 0,
      }),
    );
    unsubscribe();
  });

  it("throws error when generating without initialization", async () => {
    const { generateWebGpuResponse, resetPipelineForTesting } =
      await import("$lib/neural/webgpu-slm");
    resetPipelineForTesting();
    await expect(generateWebGpuResponse("hello")).rejects.toThrow(
      "WebGPU model not initialized",
    );
  });

  it("sets status to unsupported when WebGPU is missing and WASM fallback is disabled", async () => {
    const originalNavigator = global.navigator;
    (global as Record<string, unknown>).navigator = {};

    const { initWebGpuSlm, getWebGpuStatus, resetPipelineForTesting } =
      await import("$lib/neural/webgpu-slm");
    resetPipelineForTesting();
    const ok = await initWebGpuSlm({ allowWasmFallback: false });
    expect(ok).toBe(false);
    expect(getWebGpuStatus()).toBe("unsupported");

    global.navigator = originalNavigator;
  });

  it("falls back to WASM when WebGPU fails or is absent", async () => {
    const {
      initWebGpuSlm,
      getWebGpuStatus,
      getActiveRuntimeDevice,
      setTransformersModuleForTesting,
      resetPipelineForTesting,
      generateWebGpuResponse,
    } = await import("$lib/neural/webgpu-slm");

    resetPipelineForTesting();

    const mockPipelineFn = vi.fn().mockImplementation((_task, _model, opts) => {
      if (opts.device === "webgpu") {
        throw new Error("Unsupported device: webgpu");
      }
      return vi
        .fn()
        .mockResolvedValue([{ generated_text: "Two plus two is four." }]);
    });

    class MockTextStreamer {
      constructor(
        _tok: unknown,
        opts: { callback_function: (t: string) => void },
      ) {
        opts.callback_function("Four");
      }
    }

    setTransformersModuleForTesting({
      pipeline: mockPipelineFn,
      TextStreamer: MockTextStreamer as unknown as any,
    });

    const ok = await initWebGpuSlm({ allowWasmFallback: true });
    expect(ok).toBe(true);
    expect(getWebGpuStatus()).toBe("ready");
    expect(getActiveRuntimeDevice()).toBe("wasm");

    const tokens: string[] = [];
    const answer = await generateWebGpuResponse("What is two plus two?", {
      onToken: (t) => tokens.push(t),
    });
    expect(answer).toBe("Two plus two is four.");
    expect(tokens).toContain("Four");

    setTransformersModuleForTesting(null);
    resetPipelineForTesting();
  });

  it("prioritizes WebNN NPU when NPU hardware is available", async () => {
    const {
      initWebGpuSlm,
      getWebGpuStatus,
      getActiveRuntimeDevice,
      setTransformersModuleForTesting,
      resetPipelineForTesting,
      generateWebGpuResponse,
    } = await import("$lib/neural/webgpu-slm");

    const originalNavigator = global.navigator;
    (global as Record<string, unknown>).navigator = {
      ml: {
        createContext: vi.fn().mockResolvedValue({ deviceType: "npu" }),
      },
    };

    resetPipelineForTesting();

    let capturedDevice = "";
    let capturedSessionOptions: Record<string, unknown> | undefined;
    const mockPipelineFn = vi.fn().mockImplementation((_task, _model, opts) => {
      capturedDevice = opts.device;
      capturedSessionOptions = opts.session_options;
      return vi
        .fn()
        .mockResolvedValue([{ generated_text: "NPU inference output." }]);
    });

    setTransformersModuleForTesting({
      pipeline: mockPipelineFn,
      TextStreamer: class {} as unknown as any,
    });

    const ok = await initWebGpuSlm();
    expect(ok).toBe(true);
    expect(getWebGpuStatus()).toBe("ready");
    expect(getActiveRuntimeDevice()).toBe("npu");
    expect(capturedDevice).toBe("webnn-npu");
    expect(capturedSessionOptions).toEqual({ logSeverityLevel: 3 });

    const text = await generateWebGpuResponse("hello");
    expect(text).toBe("NPU inference output.");

    setTransformersModuleForTesting(null);
    resetPipelineForTesting();
    global.navigator = originalNavigator;
  });

  it("extracts generated text across all output shapes (string, chat, array)", async () => {
    const { extractLastMessage } = await import("$lib/neural/webgpu-slm");

    // Case 1: Plain string output
    expect(extractLastMessage([{ generated_text: "Four" }])).toBe("Four");

    // Case 2: Chat-formatted string with special tokens
    const chatStr =
      "<|im_start|>user\nWhat is two plus two?<|im_end|>\n<|im_start|>assistant\nFour<|im_end|>";
    expect(extractLastMessage([{ generated_text: chatStr }])).toBe("Four");

    // Case 3: Message objects array
    const msgs = [
      { role: "user", content: "What is two plus two?" },
      { role: "assistant", content: "Four" },
    ];
    expect(extractLastMessage([{ generated_text: msgs }])).toBe("Four");

    // Case 4: Empty / malformed output
    expect(extractLastMessage([])).toBe("");
    expect(extractLastMessage(null)).toBe("");
  });

  it("formats user prompt with grounding context when provided", async () => {
    const {
      initWebGpuSlm,
      setTransformersModuleForTesting,
      resetPipelineForTesting,
      generateWebGpuResponse,
    } = await import("$lib/neural/webgpu-slm");

    resetPipelineForTesting();

    let capturedMessages: Array<{ role: string; content: string }> = [];
    let capturedOpts: Record<string, unknown> = {};

    const mockGenerator = vi.fn().mockImplementation((msgs, opts) => {
      capturedMessages = msgs;
      capturedOpts = opts;
      return Promise.resolve([
        { generated_text: "Elliot is at RM Assessments." },
      ]);
    });

    setTransformersModuleForTesting({
      pipeline: vi.fn().mockResolvedValue(mockGenerator),
      TextStreamer: class {} as unknown as any,
    });

    await initWebGpuSlm();
    const answer = await generateWebGpuResponse("Where does Elliot work?", {
      context: "Elliot works at RM Assessments.",
    });

    expect(answer).toBe("Elliot is at RM Assessments.");
    expect(capturedMessages[1].content).toContain(
      "Context: Elliot works at RM Assessments.",
    );
    expect(capturedMessages[1].content).toContain(
      "Question: Where does Elliot work?",
    );
    expect(capturedOpts.do_sample).toBe(false);

    setTransformersModuleForTesting(null);
    resetPipelineForTesting();
  });

  it("trims incomplete trailing sentences cleanly", async () => {
    const {
      initWebGpuSlm,
      setTransformersModuleForTesting,
      resetPipelineForTesting,
      generateWebGpuResponse,
    } = await import("$lib/neural/webgpu-slm");

    resetPipelineForTesting();

    const mockGenerator = vi.fn().mockResolvedValue([
      {
        generated_text:
          "Elliot Dickerson is a Senior Web Developer with 14+ years experience. He specializes in",
      },
    ]);

    setTransformersModuleForTesting({
      pipeline: vi.fn().mockResolvedValue(mockGenerator),
      TextStreamer: class {} as unknown as any,
    });

    await initWebGpuSlm();
    const answer = await generateWebGpuResponse("Who is Elliot?");
    expect(answer).toBe(
      "Elliot Dickerson is a Senior Web Developer with 14+ years experience.",
    );

    setTransformersModuleForTesting(null);
    resetPipelineForTesting();
  });
});
