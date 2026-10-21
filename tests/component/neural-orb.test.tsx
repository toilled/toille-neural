import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import NeuralOrb from "../../src/lib/components/neural/NeuralOrb";
import type { NeuralState } from "../../src/lib/neural/types";

describe("NeuralOrb Component", () => {
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

  it("renders canvas with default size of 48px", () => {
    const { container } = render(() => <NeuralOrb />);
    const canvas = container.querySelector("canvas");

    expect(canvas).toBeInTheDocument();
    expect(canvas?.style.width).toBe("48px");
    expect(canvas?.style.height).toBe("48px");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders canvas with custom size", () => {
    const { container } = render(() => <NeuralOrb size={32} />);
    const canvas = container.querySelector("canvas");

    expect(canvas?.style.width).toBe("32px");
    expect(canvas?.style.height).toBe("32px");
  });

  it("renders across various neural states without errors", () => {
    const states: NeuralState[] = [
      "idle",
      "listening",
      "inferencing",
      "speaking",
      "executing",
    ];

    for (const state of states) {
      const { unmount, container } = render(() => (
        <NeuralOrb state={state} size={28} />
      ));
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();

      // Trigger animation frame tick
      if (rafCallbacks.length > 0) {
        const tick = rafCallbacks.pop()!;
        tick(100);
      }

      unmount();
    }
  });

  it("cleans up animation frame on unmount", () => {
    const { unmount } = render(() => <NeuralOrb />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
