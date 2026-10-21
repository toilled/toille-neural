# toille-neural

Browser-native On-Device Neuromorphic Intelligence Core (ED-AI) built with **SolidJS**, **TypeScript**, and **Vite**.

Hosted at [ai.toille.uk](https://ai.toille.uk).

## Overview

ED-AI is an on-device cybernetic consciousness and neuromorphic assistant running 100% locally in the browser with 0ms server latency. It combines a tiered architecture featuring local instant semantic retrieval, direct action execution (telemetry, theme toggling, sound engines), and on-device WebGPU Small Language Model (SLM) generative inference via Transformers.js.

## Features

- **Tier 1: Instant Local Semantic Retrieval**: Sub-millisecond intent matching, vector similarity search, and direct domain answering across Elliot Dickerson's 14+ years career history, architecture patterns, and technical capabilities.
- **Tier 2: On-Device WebGPU SLM**: Local generative language model inference powered by WebGPU (SmolLM2-135M-Instruct) in client GPU VRAM with automatic fallback.
- **Neuromorphic Synapse Visualizer**: Real-time canvas simulation of biological synaptic firing and network activation during cognitive processing.
- **Cybernetic Core Orb**: Dynamic interactive canvas orb reflecting neural states (`idle`, `inferencing`, `executing`, `speaking`).
- **Interactive Action Directives**: Embedded command triggers capable of executing system tasks, theme shifts, hardware telemetry, and sound effects directly in-browser.
- **Vocal Synthesis Bridge**: Real-time Web Speech vocal output synchronized with streaming response tokens.

## Tech Stack

- **SolidJS** for reactive UI rendering
- **TypeScript** with strict type safety
- **WebGPU / Transformers.js** for client-side neural model execution
- **Web Speech API** for local vocal synthesis
- **HTML5 Canvas** for high-DPR synaptic network simulation
- **Vite** for optimized development and bundling
- **Vitest** for unit and component testing
- **Fallow** for architecture boundaries and code health gates

## Development

```bash
# Start development server
npm run dev

# Run unit and component tests
npm test

# Run type checks
npm run check

# Lint with Oxlint and ESLint
npm run lint

# Build production bundle
npm run build

# Run code health checks
npm run fallow:health
```
