import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import NeuralHud from "../../src/lib/components/neural/NeuralHud";
import * as engine from "../../src/lib/neural/engine";
import * as webgpuSlm from "../../src/lib/neural/webgpu-slm";

describe("NeuralHud Component", () => {
  beforeEach(() => {
    vi.spyOn(webgpuSlm, "getWebGpuStatus").mockReturnValue("idle");
    vi.spyOn(webgpuSlm, "subscribeWebGpuProgress").mockReturnValue(() => {});
    vi.spyOn(engine, "askNeuralBrain").mockResolvedValue({
      query: "test",
      category: "system",
      confidence: 1,
      timestamp: Date.now(),
      text: "Neural test response",
      followUps: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders floating trigger button with ED-AI label and canvas orb", () => {
    const { getByRole, getByText } = render(() => <NeuralHud />);

    const triggerBtn = getByRole("button", {
      name: /Open ED-AI Neuromorphic Core/i,
    });
    expect(triggerBtn).toBeInTheDocument();
    expect(getByText("ED-AI")).toBeInTheDocument();
  });

  it("opens modal dialogue when trigger button is clicked", async () => {
    const { getByRole, queryByRole } = render(() => <NeuralHud />);

    expect(queryByRole("dialog")).not.toBeInTheDocument();

    const triggerBtn = getByRole("button", {
      name: /Open ED-AI Neuromorphic Core/i,
    });
    await fireEvent.click(triggerBtn);

    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("toggles modal dialogue on Ctrl+J keyboard shortcut", async () => {
    const { getByRole, queryByRole } = render(() => <NeuralHud />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queryByRole("dialog")).not.toBeInTheDocument();

    // Open via Ctrl+J
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", ctrlKey: true }),
    );
    await vi.waitFor(() => {
      expect(getByRole("dialog")).toBeInTheDocument();
    });

    // Close via Ctrl+J
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", ctrlKey: true }),
    );
    await vi.waitFor(() => {
      expect(queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("toggles modal dialogue on Meta+J (Cmd+J) keyboard shortcut", async () => {
    const { getByRole, queryByRole } = render(() => <NeuralHud />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queryByRole("dialog")).not.toBeInTheDocument();

    // Open via Cmd+J
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", metaKey: true }),
    );
    await vi.waitFor(() => {
      expect(getByRole("dialog")).toBeInTheDocument();
    });

    // Close via Cmd+J
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", metaKey: true }),
    );
    await vi.waitFor(() => {
      expect(queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens modal on neural:open custom event with initial query", async () => {
    const { getByRole } = render(() => <NeuralHud />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    window.dispatchEvent(
      new CustomEvent("neural:open", {
        detail: { query: "Launch CyberRacer" },
      }),
    );

    await vi.waitFor(() => {
      expect(getByRole("dialog")).toBeInTheDocument();
      expect(engine.askNeuralBrain).toHaveBeenCalledWith(
        "Launch CyberRacer",
        expect.anything(),
      );
    });
  });

  it("closes modal when dismiss button inside modal is clicked", async () => {
    const { getByRole, getByLabelText, queryByRole } = render(() => (
      <NeuralHud />
    ));

    const triggerBtn = getByRole("button", {
      name: /Open ED-AI Neuromorphic Core/i,
    });
    await fireEvent.click(triggerBtn);
    expect(getByRole("dialog")).toBeInTheDocument();

    const closeBtn = getByLabelText("Dismiss neural HUD dialogue");
    await fireEvent.click(closeBtn);

    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });
});
