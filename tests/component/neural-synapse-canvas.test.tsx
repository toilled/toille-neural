import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import NeuralSynapseCanvas from "../../src/lib/components/neural/NeuralSynapseCanvas";

describe("NeuralSynapseCanvas Component", () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let nextRafId = 1;

  beforeEach(() => {
    rafCallbacks = [];
    nextRafId = 1;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return nextRafId++;
      },
    );
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders canvas with correct class and accessibility attributes", () => {
    const { container } = render(() => <NeuralSynapseCanvas />);
    const canvas = container.querySelector<HTMLCanvasElement>(
      "canvas.neural-synapse-canvas",
    );

    expect(canvas).toBeInTheDocument();
    expect(canvas?.style.height).toBe("70px");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders animation frame in idle state without throwing", () => {
    const { container } = render(() => <NeuralSynapseCanvas active={false} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    expect(rafCallbacks.length).toBeGreaterThan(0);
    const tick = rafCallbacks[rafCallbacks.length - 1];
    tick(250);
  });

  it("renders animation frame in active inferencing state without throwing", () => {
    const { container } = render(() => <NeuralSynapseCanvas active={true} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    expect(rafCallbacks.length).toBeGreaterThan(0);
    const tick = rafCallbacks[rafCallbacks.length - 1];
    tick(500);
  });

  it("cancels animation frame on unmount", () => {
    const { unmount } = render(() => <NeuralSynapseCanvas />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
