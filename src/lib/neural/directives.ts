/**
 * System Telekinesis Directives Dispatcher.
 * Executes browser mutations, theme adaptations, and site telemetry actions.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { applyTheme, toggleTheme } from "$lib/theme";
import { toggleEco } from "$lib/eco";
import { playSystemBriefing } from "$lib/vocal-synth";
import type { NeuralDirective } from "./types";

function handleThemeAction(param?: string): void {
  if (param === "dark" || param === "light") {
    applyTheme(param);
    return;
  }
  toggleTheme();
}

function handleNavigation(url?: string): void {
  if (!url || typeof window === "undefined") return;
  if (url.startsWith("#")) {
    window.location.hash = url;
    return;
  }
  window.location.href = url;
}

function dispatchEventAction(name: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

const SYSTEM_ACTIONS: Record<string, () => void> = {
  racer: () => handleNavigation("/racer"),
  telemetry: () => handleNavigation("/arcade/telemetry"),
  matrix: () => dispatchEventAction("matrix:rain"),
  audio: () => {
    handleNavigation("/interests#audio-lab");
    dispatchEventAction("cyberdeck:play");
  },
  briefing: () => {
    void playSystemBriefing();
  },
  benchmark: () => handleNavigation("/experiments#edge"),
};

function handleSystemFeatures(type: string): void {
  const action = SYSTEM_ACTIONS[type];
  if (action) {
    action();
  }
}

export async function executeDirective(
  directive: NeuralDirective,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  window.dispatchEvent(
    new CustomEvent("neural:directive:executed", {
      detail: { directive },
    }),
  );

  if (directive.type === "theme") {
    handleThemeAction(directive.param);
    return true;
  }
  if (directive.type === "eco") {
    toggleEco();
    return true;
  }
  if (directive.type === "navigate") {
    handleNavigation(directive.param);
    return true;
  }

  handleSystemFeatures(directive.type);
  return true;
}
