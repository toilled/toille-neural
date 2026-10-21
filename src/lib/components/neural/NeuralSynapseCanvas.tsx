/**
 * Multi-Layer Neural Synapse Visualizer Canvas.
 * Renders input, hidden, and output neural layers with synaptic pulses.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { onSettled } from "solid-js";
import { setupDpiCanvas } from "./canvas-utils";

interface Point {
  x: number;
  y: number;
}

interface NeuralSynapseCanvasProps {
  active?: boolean;
}

function generateLayerPoints(x: number, count: number, h: number): Point[] {
  const points: Point[] = [];
  const spacing = h / (count + 1);
  for (let i = 1; i <= count; i++) {
    points.push({ x, y: i * spacing });
  }
  return points;
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  from: Point[],
  to: Point[],
  active: boolean,
): void {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = active
    ? "rgba(0, 243, 255, 0.25)"
    : "rgba(255, 255, 255, 0.08)";

  for (const f of from) {
    for (const t of to) {
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawImpulses(
  ctx: CanvasRenderingContext2D,
  from: Point[],
  to: Point[],
  time: number,
  active: boolean,
): void {
  const speed = active ? 3.0 : 1.0;
  const progress = (time * speed) % 1.0;
  ctx.save();
  ctx.fillStyle = active ? "#ff007f" : "#00f3ff";
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 6;

  for (let i = 0; i < from.length; i++) {
    const targetIdx = (i + Math.floor(time * 2)) % to.length;
    const f = from[i];
    const t = to[targetIdx];
    const ix = f.x + (t.x - f.x) * progress;
    const iy = f.y + (t.y - f.y) * progress;
    ctx.beginPath();
    ctx.arc(ix, iy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  colour: string,
): void {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 8;
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSynapseScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  active: boolean,
): void {
  ctx.clearRect(0, 0, w, h);
  const inputs = generateLayerPoints(30, 3, h);
  const hidden = generateLayerPoints(w / 2, 5, h);
  const outputs = generateLayerPoints(w - 30, 3, h);

  drawConnections(ctx, inputs, hidden, active);
  drawConnections(ctx, hidden, outputs, active);
  drawImpulses(ctx, inputs, hidden, time, active);
  drawImpulses(ctx, hidden, outputs, time, active);

  drawNodes(ctx, inputs, "#00f3ff");
  drawNodes(ctx, hidden, active ? "#ff007f" : "#8b5cf6");
  drawNodes(ctx, outputs, "#34d399");
}

function drawSynapseTick(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  elapsedMs: number,
  active: boolean,
): void {
  const w = canvas.clientWidth || 320;
  const h = canvas.clientHeight || 70;
  drawSynapseScene(ctx, w, h, elapsedMs * 0.001, active);
}

export default function NeuralSynapseCanvas(props: NeuralSynapseCanvasProps) {
  let canvasRef!: HTMLCanvasElement;
  let animId = 0;
  let startTime = 0;

  function render(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    drawSynapseTick(
      ctx,
      canvasRef,
      timestamp - startTime,
      Boolean(props.active),
    );
    animId = requestAnimationFrame(render);
  }

  onSettled(() => {
    const w = canvasRef.clientWidth || 320;
    animId = setupDpiCanvas(canvasRef, w, 70, render);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <canvas
      ref={canvasRef}
      class="neural-synapse-canvas"
      style={{ width: "100%", height: "70px", display: "block" }}
      aria-hidden="true"
    />
  );
}
