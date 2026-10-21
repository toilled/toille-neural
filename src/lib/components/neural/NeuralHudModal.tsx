/**
 * Holographic Sci-Fi Dialogue HUD Modal.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { onSettled, createEffect, For, Show } from "solid-js";
import NeuralSynapseCanvas from "./NeuralSynapseCanvas";
import NeuralMessageItem from "./NeuralMessageItem";
import { createNeuralChatState } from "./useNeuralChatState";
import type { NeuralDirective, NeuralState } from "$lib/neural/types";
import type { WebGpuStatus } from "$lib/neural/webgpu-types";
import { getActiveRuntimeDevice } from "$lib/neural/webgpu-slm";

interface NeuralHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

function isSynapseActive(state: NeuralState): boolean {
  return state === "inferencing" || state === "executing";
}

const STATUS_LABELS: Partial<Record<WebGpuStatus, string>> = {
  unsupported: "⚡ HARDWARE UNSUPPORTED",
  error: "⚡ RETRY SLM",
  idle: "⚡ ENGAGE SLM",
};

function getWebGpuBtnLabel(status: WebGpuStatus, pct: number): string {
  if (status === "downloading") return `⚡ DOWNLOADING ${pct}%`;
  if (status === "ready") {
    return `⚡ ${getActiveRuntimeDevice().toUpperCase()}: ACTIVE`;
  }
  return STATUS_LABELS[status] ?? "⚡ ENGAGE SLM";
}

function getCoreBadgeLabel(status: WebGpuStatus): string {
  if (status === "ready") {
    return `● ${getActiveRuntimeDevice().toUpperCase()} SLM`;
  }
  return "● 0ms LOCAL";
}

function WebGpuProgressBar(props: { progress: number; message: string }) {
  return (
    <div
      class="webgpu-progress-bar"
      role="progressbar"
      aria-valuenow={props.progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        class="webgpu-progress-fill"
        style={{ width: `${props.progress}%` }}
      />
      <span class="webgpu-progress-text mono">{props.message}</span>
    </div>
  );
}

function NeuralGpuBtn(props: {
  status: WebGpuStatus;
  progress: number;
  onEngage: () => void;
}) {
  const isGpuActive = () => props.status === "ready";
  const isDownloading = () => props.status === "downloading";
  const btnClass = () =>
    isGpuActive() ? "neural-gpu-btn mono active" : "neural-gpu-btn mono";

  return (
    <button
      type="button"
      class={btnClass()}
      disabled={isDownloading()}
      onClick={() => props.onEngage()}
      title="Toggle Tier 2 WebGPU Generative SLM"
      aria-label="Engage WebGPU generative small language model"
    >
      {getWebGpuBtnLabel(props.status, props.progress)}
    </button>
  );
}

function NeuralVoiceBtn(props: {
  isVoiceActive: boolean;
  onToggle: () => void;
}) {
  const btnClass = () =>
    props.isVoiceActive
      ? "neural-voice-btn mono active"
      : "neural-voice-btn mono";
  const btnTitle = () =>
    props.isVoiceActive ? "Vocal Synthesis: ONLINE" : "Vocal Synthesis: MUTED";
  const btnLabel = () =>
    props.isVoiceActive ? "🔊 VOICE: ON" : "🔇 VOICE: OFF";

  return (
    <button
      type="button"
      class={btnClass()}
      onClick={() => props.onToggle()}
      title={btnTitle()}
      aria-label="Toggle voice synthesis"
    >
      {btnLabel()}
    </button>
  );
}

function NeuralHudHeader(props: {
  isVoiceActive: boolean;
  webGpuStatus: WebGpuStatus;
  webGpuProgress: number;
  onToggleVoice: () => void;
  onEngageWebGpu: () => void;
  onClose: () => void;
}) {
  return (
    <div class="neural-hud-header">
      <div class="neural-hud-title mono">
        <span class="neural-title-tag">[NEURAL CORE]</span>
        <span class="neural-title-name">ED-AI v2.8</span>
        <span class="neural-badge-live">
          {getCoreBadgeLabel(props.webGpuStatus)}
        </span>
      </div>
      <div class="neural-hud-controls">
        <NeuralGpuBtn
          status={props.webGpuStatus}
          progress={props.webGpuProgress}
          onEngage={props.onEngageWebGpu}
        />
        <NeuralVoiceBtn
          isVoiceActive={props.isVoiceActive}
          onToggle={props.onToggleVoice}
        />
        <button
          type="button"
          class="neural-close-btn mono"
          onClick={() => props.onClose()}
          aria-label="Dismiss neural HUD dialogue"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function NeuralHudModal(props: NeuralHudModalProps) {
  const {
    messages,
    input,
    setInput,
    neuralState,
    isVoiceActive,
    setIsVoiceActive,
    webGpuStatus,
    webGpuProgress,
    webGpuMessage,
    engageWebGpu,
    submitQuery,
    triggerDirective,
  } = createNeuralChatState();

  let messagesContainerRef!: HTMLDivElement;
  let inputRef!: HTMLInputElement;

  function scrollToBottom(): void {
    if (messagesContainerRef) {
      messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight;
    }
  }

  createEffect(
    () => messages(),
    () => scrollToBottom(),
  );

  createEffect(
    () => props.isOpen,
    (open) => {
      if (open && inputRef) {
        setTimeout(() => inputRef.focus(), 80);
      }
    },
  );

  createEffect(
    () => ({ open: props.isOpen, q: props.initialQuery }),
    ({ open, q }) => {
      if (open && q) {
        void submitQuery(q);
      }
    },
  );

  function handleFormSubmit(e: Event): void {
    e.preventDefault();
    const query = input().trim();
    if (!query) return;
    void submitQuery(query);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      props.onClose();
    }
  }

  function handleOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  }

  onSettled(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });

  return (
    <Show when={props.isOpen}>
      <div
        class="neural-hud-overlay neural-open"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label="ED-AI Neuromorphic Core"
      >
        <div class="neural-hud-window panel panel-glow">
          <NeuralHudHeader
            isVoiceActive={isVoiceActive()}
            webGpuStatus={webGpuStatus()}
            webGpuProgress={webGpuProgress()}
            onToggleVoice={() => setIsVoiceActive(!isVoiceActive())}
            onEngageWebGpu={() => void engageWebGpu()}
            onClose={props.onClose}
          />

          <Show when={webGpuStatus() === "downloading"}>
            <WebGpuProgressBar
              progress={webGpuProgress()}
              message={webGpuMessage()}
            />
          </Show>

          <NeuralSynapseCanvas active={isSynapseActive(neuralState())} />

          <div class="neural-messages-container" ref={messagesContainerRef}>
            <For each={messages()}>
              {(msg) => (
                <NeuralMessageItem
                  message={msg}
                  onSelectQuery={(q) => void submitQuery(q)}
                  onExecuteDirective={(d: NeuralDirective) =>
                    triggerDirective(d)
                  }
                />
              )}
            </For>
          </div>

          <form class="neural-input-form" onSubmit={handleFormSubmit}>
            <div class="neural-input-wrapper">
              <span class="neural-prompt mono neon-cyan">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                class="neural-text-input mono"
                placeholder="Ask ED-AI anything (e.g. 'skills', 'RM Assessments', 'play synth')..."
                value={input()}
                onInput={(e) => setInput(e.currentTarget.value)}
                aria-label="Query for ED-AI"
              />
              <button
                type="submit"
                class="neural-send-btn mono"
                aria-label="Send query"
              >
                SYNAPSE ↵
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
