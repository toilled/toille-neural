import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, flush } from "solid-js";
import * as engine from "../../src/lib/neural/engine";
import * as directives from "../../src/lib/neural/directives";
import * as webgpuSlm from "../../src/lib/neural/webgpu-slm";
import { createNeuralChatState } from "../../src/lib/components/neural/useNeuralChatState";
import type { WebGpuProgress } from "../../src/lib/neural/webgpu-types";

describe("createNeuralChatState", () => {
  let progressSubscriber: ((p: WebGpuProgress) => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(webgpuSlm, "getWebGpuStatus").mockReturnValue("idle");
    vi.spyOn(webgpuSlm, "subscribeWebGpuProgress").mockImplementation((cb) => {
      progressSubscriber = cb;
      return () => {
        progressSubscriber = undefined;
      };
    });
    vi.spyOn(engine, "askNeuralBrain").mockResolvedValue({
      query: "test",
      category: "system",
      confidence: 1,
      timestamp: Date.now(),
      text: "Neural response text",
      directive: { type: "theme", param: "dark", label: "Dark Mode" },
      followUps: ["Next prompt"],
    });
    vi.spyOn(directives, "executeDirective").mockResolvedValue(true);
    vi.spyOn(webgpuSlm, "initWebGpuSlm").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createHarness() {
    return createRoot(() => createNeuralChatState());
  }

  it("initializes with the default online message and idle state", () => {
    const state = createHarness();
    flush();

    expect(state.messages().length).toBe(1);
    expect(state.messages()[0].role).toBe("assistant");
    expect(state.messages()[0].id).toBe("msg-init");
    expect(state.neuralState()).toBe("idle");
    expect(state.isVoiceActive()).toBe(false);
    expect(state.webGpuStatus()).toBe("idle");
  });

  it("submits a user query and streams tokens to completion", async () => {
    const state = createHarness();
    flush();

    const queryPromise = state.submitQuery("hello world");
    await queryPromise;
    flush();

    expect(state.messages().length).toBe(3);
    expect(state.messages()[1].role).toBe("user");
    expect(state.messages()[1].content).toBe("hello world");
    expect(state.messages()[2].role).toBe("assistant");
    expect(state.messages()[2].isStreaming).toBe(true);

    vi.advanceTimersByTime(200);
    flush();

    expect(state.messages()[2].content).toBe("Neural response text");
    expect(state.messages()[2].isStreaming).toBe(false);
    expect(state.neuralState()).toBe("idle");
  });

  it("ignores empty queries", async () => {
    const state = createHarness();
    flush();

    await state.submitQuery("   ");
    flush();

    expect(state.messages().length).toBe(1);
    expect(engine.askNeuralBrain).not.toHaveBeenCalled();
  });

  it("toggles voice state and passes voice flag to askNeuralBrain", async () => {
    const state = createHarness();
    flush();

    state.setIsVoiceActive(true);
    flush();

    const queryPromise = state.submitQuery("speak test");
    await queryPromise;
    flush();

    expect(engine.askNeuralBrain).toHaveBeenCalledWith("speak test", {
      executeDirectives: false,
      speakResponse: true,
    });
  });

  it("triggers directive execution and resets to idle after delay", () => {
    const state = createHarness();
    flush();

    state.triggerDirective({
      type: "theme",
      param: "dark",
      label: "Dark Mode",
    });
    flush();

    expect(state.neuralState()).toBe("executing");
    expect(directives.executeDirective).toHaveBeenCalledWith({
      type: "theme",
      param: "dark",
      label: "Dark Mode",
    });

    vi.advanceTimersByTime(1050);
    flush();
    expect(state.neuralState()).toBe("idle");
  });

  it("engages WebGPU SLM and appends system confirmation message", async () => {
    const state = createHarness();
    flush();

    await state.engageWebGpu();
    flush();

    expect(webgpuSlm.initWebGpuSlm).toHaveBeenCalled();
    const lastMsg = state.messages()[state.messages().length - 1];
    expect(lastMsg.role).toBe("system");
    expect(lastMsg.content).toContain("SmolLM2-135M-Instruct active");
  });

  it("handles webgpu progress notifications", () => {
    const state = createHarness();
    flush();

    if (progressSubscriber) {
      progressSubscriber({
        status: "downloading",
        percent: 75,
        message: "Loading weights...",
      });
      flush();
    }

    expect(state.webGpuStatus()).toBe("downloading");
    expect(state.webGpuProgress()).toBe(75);
    expect(state.webGpuMessage()).toBe("Loading weights...");
  });
});
