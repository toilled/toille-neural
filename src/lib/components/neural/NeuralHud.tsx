/**
 * Floating Neural HUD Core & Modal Trigger.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { createSignal, onSettled } from "solid-js";
import NeuralOrb from "./NeuralOrb";
import NeuralHudModal from "./NeuralHudModal";
import "./NeuralHud.css";

interface NeuralOpenEventDetail {
  query?: string;
}

export default function NeuralHud() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [initialQuery, setInitialQuery] = createSignal<string | undefined>();

  function handleOpenEvent(e: Event): void {
    const detail = (e as CustomEvent<NeuralOpenEventDetail>).detail;
    setIsOpen(true);
    if (detail?.query) {
      setInitialQuery(detail.query);
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    const hasMod = e.ctrlKey || e.metaKey;
    if (hasMod && e.key.toLowerCase() === "j") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }

  onSettled(() => {
    window.addEventListener("neural:open", handleOpenEvent);
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("neural:open", handleOpenEvent);
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  return (
    <>
      <button
        type="button"
        class={`neural-trigger-btn mono ${isOpen() ? "active" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open ED-AI Neuromorphic Core"
        title="ED-AI On-Device Neural Core (Ctrl+J)"
      >
        <NeuralOrb state="idle" size={28} />
        <span class="neural-trigger-text">ED-AI</span>
      </button>

      <NeuralHudModal
        isOpen={isOpen()}
        onClose={() => {
          setIsOpen(false);
          setInitialQuery(undefined);
        }}
        initialQuery={initialQuery()}
      />
    </>
  );
}
