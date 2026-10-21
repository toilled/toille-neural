import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { synthesizeVoiceResponse } from "$lib/neural/voice-bridge";
import { executeDirective } from "$lib/neural/directives";
import type { NeuralResponse, NeuralDirective } from "$lib/neural/types";
import * as vocalSynth from "$lib/vocal-synth";
import * as themeModule from "$lib/theme";
import * as ecoModule from "$lib/eco";

const createMockResponse = (text: string): NeuralResponse => ({
  text,
  confidence: 1,
  query: "test query",
  category: "system",
  followUps: [],
  timestamp: Date.now(),
});

describe("ED-AI Voice Bridge (synthesizeVoiceResponse)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when voice synthesis is muted", () => {
    vi.spyOn(vocalSynth, "isVoiceMuted").mockReturnValue(true);
    const speakSpy = vi.spyOn(vocalSynth, "speak").mockResolvedValue(undefined);

    const response = createMockResponse("Neural systems online.");

    synthesizeVoiceResponse(response);
    expect(speakSpy).not.toHaveBeenCalled();
  });

  it("cleans markdown, URLs, metadata tags and speaks valid text", () => {
    vi.spyOn(vocalSynth, "isVoiceMuted").mockReturnValue(false);
    const speakSpy = vi.spyOn(vocalSynth, "speak").mockResolvedValue(undefined);

    const response = createMockResponse(
      "//ED-AI: [SYS_ONLINE] **Neural** core activated at https://toille.io and ready.",
    );

    synthesizeVoiceResponse(response);
    expect(speakSpy).toHaveBeenCalledWith(
      "Neural core activated at  and ready.",
    );
  });

  it("does not speak if cleaned speech text resolves to empty string", () => {
    vi.spyOn(vocalSynth, "isVoiceMuted").mockReturnValue(false);
    const speakSpy = vi.spyOn(vocalSynth, "speak").mockResolvedValue(undefined);

    const response = createMockResponse(
      "//ED-AI: [EMPTY_TAG] ** ** https://example.com",
    );

    synthesizeVoiceResponse(response);
    expect(speakSpy).not.toHaveBeenCalled();
  });
});

describe("ED-AI System Telekinesis Directives (executeDirective)", () => {
  let dispatchedEvents: CustomEvent[] = [];
  const originalLocation = window.location;

  beforeEach(() => {
    dispatchedEvents = [];
    vi.restoreAllMocks();

    vi.spyOn(window, "dispatchEvent").mockImplementation((event: Event) => {
      dispatchedEvents.push(event as CustomEvent);
      return true;
    });

    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost/",
        hash: "",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("dispatches neural:directive:executed event and handles theme directives", async () => {
    const applyThemeSpy = vi
      .spyOn(themeModule, "applyTheme")
      .mockImplementation(() => {});
    const toggleThemeSpy = vi
      .spyOn(themeModule, "toggleTheme")
      .mockReturnValue("dark");

    const directive: NeuralDirective = {
      type: "theme",
      param: "light",
      label: "Switch to light mode",
    };

    const res = await executeDirective(directive);
    expect(res).toBe(true);
    expect(applyThemeSpy).toHaveBeenCalledWith("light");

    // Theme toggle fallback
    await executeDirective({ type: "theme", label: "Toggle theme" });
    expect(toggleThemeSpy).toHaveBeenCalled();

    expect(
      dispatchedEvents.some((e) => e.type === "neural:directive:executed"),
    ).toBe(true);
  });

  it("handles eco directive execution", async () => {
    const toggleEcoSpy = vi.spyOn(ecoModule, "toggleEco").mockReturnValue("on");

    const res = await executeDirective({ type: "eco", label: "Toggle eco" });
    expect(res).toBe(true);
    expect(toggleEcoSpy).toHaveBeenCalled();
  });

  it("handles navigate directive with path and hash", async () => {
    await executeDirective({
      type: "navigate",
      param: "/racer",
      label: "Go to Racer",
    });
    expect(window.location.href).toBe("/racer");

    await executeDirective({
      type: "navigate",
      param: "#audio-lab",
      label: "Jump to Audio Lab",
    });
    expect(window.location.hash).toBe("#audio-lab");

    // No param
    const noParamRes = await executeDirective({
      type: "navigate",
      label: "Empty Nav",
    });
    expect(noParamRes).toBe(true);
  });

  it("handles system feature action shortcuts", async () => {
    const briefingSpy = vi
      .spyOn(vocalSynth, "playSystemBriefing")
      .mockResolvedValue(undefined);

    await executeDirective({ type: "racer", label: "Open Racer" });
    expect(window.location.href).toBe("/racer");

    await executeDirective({ type: "telemetry", label: "Open Telemetry" });
    expect(window.location.href).toBe("/arcade/telemetry");

    await executeDirective({ type: "matrix", label: "Matrix Rain" });
    expect(dispatchedEvents.some((e) => e.type === "matrix:rain")).toBe(true);

    await executeDirective({ type: "audio", label: "Start Cyberdeck" });
    expect(window.location.href).toBe("/interests#audio-lab");
    expect(dispatchedEvents.some((e) => e.type === "cyberdeck:play")).toBe(
      true,
    );

    await executeDirective({ type: "briefing", label: "Play Briefing" });
    expect(briefingSpy).toHaveBeenCalled();

    await executeDirective({ type: "benchmark", label: "Run Benchmark" });
    expect(window.location.href).toBe("/experiments#edge");
  });
});
