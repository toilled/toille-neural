/**
 * Voice Synthesis & Speech Recognition Bridge for ED-AI.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { isVoiceMuted, speak } from "$lib/vocal-synth";
import type { NeuralResponse } from "./types";

function cleanSpeechText(text: string): string {
  return text
    .replace(/\/\/[^:]*:\s*/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[#*`_~]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
}

export function synthesizeVoiceResponse(response: NeuralResponse): void {
  if (isVoiceMuted()) return;
  const clean = cleanSpeechText(response.text);
  if (!clean) return;
  void speak(clean);
}
