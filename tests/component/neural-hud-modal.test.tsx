import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import NeuralHudModal from "../../src/lib/components/neural/NeuralHudModal";
import * as engine from "../../src/lib/neural/engine";
import * as webgpuSlm from "../../src/lib/neural/webgpu-slm";

describe("NeuralHudModal Component", () => {
  beforeEach(() => {
    vi.spyOn(webgpuSlm, "getWebGpuStatus").mockReturnValue("idle");
    vi.spyOn(webgpuSlm, "subscribeWebGpuProgress").mockReturnValue(() => {});
    vi.spyOn(webgpuSlm, "initWebGpuSlm").mockResolvedValue(true);
    vi.spyOn(engine, "askNeuralBrain").mockResolvedValue({
      query: "test",
      category: "system",
      confidence: 1,
      timestamp: Date.now(),
      text: "Neural test response",
      followUps: ["Next prompt"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(() => (
      <NeuralHudModal isOpen={false} onClose={vi.fn()} />
    ));

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("renders holographic dialogue window when isOpen is true", () => {
    const { getByRole, getByText, getByPlaceholderText } = render(() => (
      <NeuralHudModal isOpen={true} onClose={vi.fn()} />
    ));

    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByText("ED-AI v2.8")).toBeInTheDocument();
    expect(getByPlaceholderText(/Ask ED-AI anything/i)).toBeInTheDocument();
  });

  it("triggers onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(() => (
      <NeuralHudModal isOpen={true} onClose={onClose} />
    ));

    const closeBtn = getByLabelText("Dismiss neural HUD dialogue");
    await fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose on Escape keypress", () => {
    const onClose = vi.fn();
    render(() => <NeuralHudModal isOpen={true} onClose={onClose} />);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose when clicking overlay backdrop", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(() => (
      <NeuralHudModal isOpen={true} onClose={onClose} />
    ));

    const dialogOverlay = getByRole("dialog");
    await fireEvent.click(dialogOverlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("toggles voice synthesis button", async () => {
    const { getByLabelText, getByText } = render(() => (
      <NeuralHudModal isOpen={true} onClose={vi.fn()} />
    ));

    const voiceBtn = getByLabelText("Toggle voice synthesis");
    expect(getByText("🔇 VOICE: OFF")).toBeInTheDocument();

    await fireEvent.click(voiceBtn);
    expect(getByText("🔊 VOICE: ON")).toBeInTheDocument();
  });

  it("submits query via input form and displays new user message", async () => {
    const { getByPlaceholderText, getByText } = render(() => (
      <NeuralHudModal isOpen={true} onClose={vi.fn()} />
    ));

    const input = getByPlaceholderText(
      /Ask ED-AI anything/i,
    ) as HTMLInputElement;
    await fireEvent.input(input, {
      target: { value: "What are Elliot skills?" },
    });

    const submitBtn = getByText("SYNAPSE ↵");
    await fireEvent.click(submitBtn);

    expect(engine.askNeuralBrain).toHaveBeenCalledWith(
      "What are Elliot skills?",
      expect.anything(),
    );
    expect(getByText("What are Elliot skills?")).toBeInTheDocument();
  });

  it("handles initialQuery when opened with a prompt", () => {
    render(() => (
      <NeuralHudModal
        isOpen={true}
        onClose={vi.fn()}
        initialQuery="Tell me about CyberRacer"
      />
    ));

    expect(engine.askNeuralBrain).toHaveBeenCalledWith(
      "Tell me about CyberRacer",
      expect.anything(),
    );
  });
});
