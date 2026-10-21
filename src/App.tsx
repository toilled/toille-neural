import { onSettled, For, Show } from "solid-js";
import NeuralSynapseCanvas from "./lib/components/neural/NeuralSynapseCanvas";
import NeuralOrb from "./lib/components/neural/NeuralOrb";
import NeuralMessageItem from "./lib/components/neural/NeuralMessageItem";
import { createNeuralChatState } from "./lib/components/neural/useNeuralChatState";
import { getActiveRuntimeDevice } from "./lib/neural/webgpu-slm";
import type { WebGpuStatus } from "./lib/neural/webgpu-types";
import type { NeuralDirective } from "./lib/neural/types";
import "./lib/components/neural/NeuralHud.css";
import "./styles.css";

function getCoreBadgeLabel(status: WebGpuStatus): string {
  if (status === "ready") {
    return `● ${getActiveRuntimeDevice().toUpperCase()} SLM ACTIVE`;
  }
  return "● 0ms LOCAL RETRIEVAL";
}

function getWebGpuBtnLabel(status: WebGpuStatus, pct: number): string {
  if (status === "downloading") return `⚡ DOWNLOADING ${pct}%`;
  if (status === "ready")
    return `⚡ ${getActiveRuntimeDevice().toUpperCase()}: ACTIVE`;
  if (status === "unsupported") return "⚡ HARDWARE UNSUPPORTED";
  if (status === "error") return "⚡ RETRY SLM";
  return "⚡ ENGAGE WEBGPU SLM";
}

function GpuProgressBar(props: { progress: number; message: string }) {
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

function HeaderBar(props: {
  webGpuStatus: WebGpuStatus;
  webGpuProgress: number;
  isVoiceActive: boolean;
  onEngageGpu: () => void;
  onToggleVoice: () => void;
  onClear: () => void;
}) {
  return (
    <header class="neural-nav-bar" role="banner">
      <div class="neural-nav-left">
        <a href="https://toille.uk" class="neural-nav-back mono">
          ← TOILLE.UK
        </a>
        <div class="neural-nav-title mono">
          <span class="neural-tag">[NEURAL CORE]</span>
          <span class="neural-version">ED-AI v2.8</span>
          <span class="neural-status-badge">
            {getCoreBadgeLabel(props.webGpuStatus)}
          </span>
        </div>
      </div>

      <div class="neural-nav-controls">
        <button
          type="button"
          class={`neural-btn-control mono ${props.webGpuStatus === "ready" ? "active" : ""}`}
          onClick={() => props.onEngageGpu()}
          disabled={
            props.webGpuStatus === "unsupported" ||
            props.webGpuStatus === "downloading"
          }
        >
          {getWebGpuBtnLabel(props.webGpuStatus, props.webGpuProgress)}
        </button>

        <button
          type="button"
          class={`neural-btn-control mono ${props.isVoiceActive ? "active" : ""}`}
          onClick={() => props.onToggleVoice()}
        >
          {props.isVoiceActive ? "🎙️ LISTENING" : "🎙️ VOICE"}
        </button>

        <button
          type="button"
          class="neural-btn-control mono"
          onClick={() => props.onClear()}
        >
          RESET
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const {
    neuralState,
    messages,
    input,
    setInput,
    webGpuStatus,
    webGpuProgress,
    webGpuMessage,
    isVoiceActive,
    setIsVoiceActive,
    engageWebGpu,
    submitQuery,
    triggerDirective,
    clearMessages,
  } = createNeuralChatState();

  let messagesContainerRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    if (messagesContainerRef) {
      messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight;
    }
  };

  onSettled(() => {
    scrollToBottom();
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const query = input().trim();
    if (!query) return;
    void submitQuery(query);
    setTimeout(scrollToBottom, 50);
  };

  const isSynapseActive = () =>
    neuralState() === "inferencing" || neuralState() === "executing";

  return (
    <div class="neural-standalone-shell">
      <HeaderBar
        webGpuStatus={webGpuStatus()}
        webGpuProgress={webGpuProgress()}
        isVoiceActive={isVoiceActive()}
        onEngageGpu={() => void engageWebGpu()}
        onToggleVoice={() => setIsVoiceActive(!isVoiceActive())}
        onClear={clearMessages}
      />

      <Show when={webGpuStatus() === "downloading"}>
        <GpuProgressBar progress={webGpuProgress()} message={webGpuMessage()} />
      </Show>

      <div class="neural-main-stage">
        <NeuralSynapseCanvas active={isSynapseActive()} />

        <div class="neural-orb-anchor">
          <NeuralOrb state={neuralState()} />
        </div>

        <main class="neural-chat-column" role="main">
          <div class="neural-messages-scroll" ref={messagesContainerRef}>
            <For each={messages()}>
              {(msg) => (
                <NeuralMessageItem
                  message={msg}
                  onSelectQuery={(chip: string) => {
                    void submitQuery(chip);
                    setTimeout(scrollToBottom, 50);
                  }}
                  onExecuteDirective={(dir: NeuralDirective) =>
                    triggerDirective(dir)
                  }
                />
              )}
            </For>
          </div>

          <div class="neural-input-dock">
            <form class="neural-input-form-box" onSubmit={onSubmit}>
              <span class="neural-prompt-symbol mono neon-cyan">&gt;_</span>
              <input
                type="text"
                class="neural-input-field mono"
                placeholder="Ask ED-AI about Elliot, architectures, web tech, or type system commands..."
                value={input()}
                onInput={(e) => setInput(e.currentTarget.value)}
                aria-label="Ask ED-AI Neural Core"
              />
              <button
                type="submit"
                class="neural-submit-btn mono"
                aria-label="Transmit query"
              >
                TRANSMIT
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
