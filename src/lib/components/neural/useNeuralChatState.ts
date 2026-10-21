/**
 * State Management & Message Streaming for Neural HUD.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { createSignal, onSettled } from "solid-js";
import { askNeuralBrain } from "$lib/neural/engine";
import { executeDirective } from "$lib/neural/directives";
import {
  getWebGpuStatus,
  initWebGpuSlm,
  subscribeWebGpuProgress,
} from "$lib/neural/webgpu-slm";
import type {
  ChatMessage,
  NeuralDirective,
  NeuralState,
} from "$lib/neural/types";
import type { WebGpuProgress, WebGpuStatus } from "$lib/neural/webgpu-types";

const INITIAL_WELCOME: ChatMessage = {
  id: "msg-init",
  role: "assistant",
  content:
    "// ED-AI NEUROMORPHIC CORE [ONLINE]\nI am Elliot Dickerson's on-device cybernetic consciousness. Operating 100% locally on your machine with 0ms server latency. Ask me about his 14+ years career, enterprise architecture at RM Assessments, PHP/SQL/SolidJS stack, or issue system commands.",
  followUps: [
    "Tell me about Elliot's current role",
    "What are his core technical skills?",
    "Launch CyberRacer arcade engine",
  ],
  timestamp: Date.now(),
};

export function createNeuralChatState() {
  const [messages, setMessages] = createSignal<ChatMessage[]>([
    INITIAL_WELCOME,
  ]);
  const [input, setInput] = createSignal("");
  const [neuralState, setNeuralState] = createSignal<NeuralState>("idle");
  const [isVoiceActive, setIsVoiceActive] = createSignal(false);
  const [webGpuStatus, setWebGpuStatus] =
    createSignal<WebGpuStatus>(getWebGpuStatus());
  const [webGpuProgress, setWebGpuProgress] = createSignal(0);
  const [webGpuMessage, setWebGpuMessage] = createSignal("");

  onSettled(() => {
    return subscribeWebGpuProgress((p: WebGpuProgress) => {
      setWebGpuStatus(p.status);
      setWebGpuProgress(p.percent);
      setWebGpuMessage(p.message);
    });
  });

  function appendUserMessage(text: string): string {
    const id = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    return id;
  }

  function appendAssistantPlaceholder(): string {
    const id = `asst-${Date.now()}`;
    const asstMsg: ChatMessage = {
      id,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, asstMsg]);
    return id;
  }

  function updateStreamingMessage(
    id: string,
    content: string,
    directive?: NeuralDirective,
    followUps?: string[],
  ): void {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content, directive, followUps } : m,
      ),
    );
  }

  function finalizeStreamingMessage(id: string): void {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)),
    );
    setNeuralState("idle");
  }

  function streamTokens(
    msgId: string,
    fullText: string,
    directive?: NeuralDirective,
    followUps?: string[],
  ): void {
    let index = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      index += chunkSize;
      const current = fullText.slice(0, index);
      updateStreamingMessage(msgId, current, directive, followUps);
      if (index >= fullText.length) {
        clearInterval(interval);
        finalizeStreamingMessage(msgId);
      }
    }, 16);
  }

  async function submitQuery(queryText: string): Promise<void> {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    setInput("");
    setNeuralState("inferencing");

    const assistantMsgId = appendAssistantPlaceholder();
    const response = await askNeuralBrain(trimmed, {
      executeDirectives: false,
      speakResponse: isVoiceActive(),
    });

    setNeuralState(isVoiceActive() ? "speaking" : "executing");
    streamTokens(
      assistantMsgId,
      response.text,
      response.directive,
      response.followUps,
    );
  }

  function triggerDirective(directive: NeuralDirective): void {
    setNeuralState("executing");
    void executeDirective(directive);
    setTimeout(() => setNeuralState("idle"), 1000);
  }

  async function engageWebGpu(): Promise<void> {
    setNeuralState("inferencing");
    const ok = await initWebGpuSlm();
    setNeuralState("idle");
    if (ok) {
      const welcome: ChatMessage = {
        id: `sys-webgpu-${Date.now()}`,
        role: "system",
        content:
          "// TIER 2 WEBGPU SLM ENGAGED // SmolLM2-135M-Instruct active in local GPU VRAM.\nOpen-ended generative inference now running 100% on-device.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, welcome]);
    }
  }

  function clearMessages(): void {
    setMessages([INITIAL_WELCOME]);
  }

  return {
    messages,
    input,
    setInput,
    neuralState,
    setNeuralState,
    isVoiceActive,
    setIsVoiceActive,
    webGpuStatus,
    webGpuProgress,
    webGpuMessage,
    engageWebGpu,
    submitQuery,
    triggerDirective,
    clearMessages,
  };
}
