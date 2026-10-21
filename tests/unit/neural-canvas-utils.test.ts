import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setupDpiCanvas } from "../../src/lib/components/neural/canvas-utils";

describe("setupDpiCanvas", () => {
  let canvas: HTMLCanvasElement;
  let mockCtx: {
    scale: ReturnType<typeof vi.fn>;
  };
  let originalDpr: number;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    mockCtx = {
      scale: vi.fn(),
    };
    vi.spyOn(canvas, "getContext").mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );
    originalDpr = window.devicePixelRatio;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (_cb: FrameRequestCallback) => {
        return 42;
      },
    );
  });

  afterEach(() => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: originalDpr,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("configures canvas dimensions with standard DPR", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: 1,
      configurable: true,
    });
    const onTick = vi.fn();

    const id = setupDpiCanvas(canvas, 100, 50, onTick);

    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
    expect(mockCtx.scale).toHaveBeenCalledWith(1, 1);
    expect(id).toBe(42);
    expect(window.requestAnimationFrame).toHaveBeenCalledWith(onTick);
  });

  it("clamps devicePixelRatio to maximum of 2 on high-density displays", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: 3.5,
      configurable: true,
    });

    setupDpiCanvas(canvas, 120, 60, vi.fn());

    expect(canvas.width).toBe(240);
    expect(canvas.height).toBe(120);
    expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
  });

  it("falls back safely when getContext returns null", () => {
    vi.spyOn(canvas, "getContext").mockReturnValue(null);

    const id = setupDpiCanvas(canvas, 80, 40, vi.fn());

    expect(canvas.width).toBe(80);
    expect(canvas.height).toBe(40);
    expect(id).toBe(42);
  });
});
