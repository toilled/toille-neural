/**
 * Glowing Pulsating Neural Synapse Orb Canvas.
 * Visualizes AI operational states (idle, listening, inferencing, speaking).
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { onSettled } from "solid-js";
import { setupDpiCanvas } from "./canvas-utils";
import type { NeuralState } from "$lib/neural/types";

interface NeuralOrbProps {
  state?: NeuralState;
  size?: number;
}

const STATE_COLOURS: Record<NeuralState, string> = {
  idle: "#00f3ff",
  listening: "#fbbf24",
  inferencing: "#ff007f",
  speaking: "#a855f7",
  executing: "#34d399",
};

function getOrbColour(state: NeuralState): string {
  return STATE_COLOURS[state] ?? "#00f3ff";
}

function drawOrbCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  colour: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();
}

function drawPulsingRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  colour: string,
): void {
  const pulse = Math.sin(time * 3) * 3;
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(cx, cy, 14 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 19 - pulse * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawOrbitingNodes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  colour: string,
): void {
  const nodeCount = 5;
  ctx.save();
  ctx.fillStyle = colour;
  for (let i = 0; i < nodeCount; i++) {
    const angle = time * 2 + (i * Math.PI * 2) / nodeCount;
    const nx = cx + Math.cos(angle) * 16;
    const ny = cy + Math.sin(angle) * 16;
    ctx.beginPath();
    ctx.arc(nx, ny, 1.75, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawOrbScene(
  ctx: CanvasRenderingContext2D,
  size: number,
  time: number,
  colour: string,
): void {
  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);
  drawPulsingRings(ctx, cx, cy, time, colour);
  drawOrbCenter(ctx, cx, cy, 6, colour);
  drawOrbitingNodes(ctx, cx, cy, time, colour);
}

function drawOrbTick(
  ctx: CanvasRenderingContext2D,
  elapsedMs: number,
  sizeProp: number | undefined,
  stateProp: NeuralState | undefined,
): void {
  const size = sizeProp ?? 48;
  const colour = getOrbColour(stateProp ?? "idle");
  drawOrbScene(ctx, size, elapsedMs * 0.001, colour);
}

export default function NeuralOrb(props: NeuralOrbProps) {
  let canvasRef!: HTMLCanvasElement;
  let animId = 0;
  let startTime = 0;

  function render(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    drawOrbTick(ctx, timestamp - startTime, props.size, props.state);
    animId = requestAnimationFrame(render);
  }

  onSettled(() => {
    const size = props.size ?? 48;
    animId = setupDpiCanvas(canvasRef, size, size, render);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${props.size ?? 48}px`,
        height: `${props.size ?? 48}px`,
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
