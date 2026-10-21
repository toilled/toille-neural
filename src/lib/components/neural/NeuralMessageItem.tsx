/**
 * Chat Message Item for Neural HUD.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

import { For, Show } from "solid-js";
import type { ChatMessage, NeuralDirective } from "$lib/neural/types";

interface NeuralMessageItemProps {
  message: ChatMessage;
  onSelectQuery: (q: string) => void;
  onExecuteDirective: (d: NeuralDirective) => void;
}

function MessageHeader(props: { role: string; timestamp: number }) {
  return (
    <div class="neural-msg-header mono">
      <span class="neural-msg-sender">
        {props.role === "user" ? "// HUMAN PROMPT" : "// ED-AI SYNAPSE"}
      </span>
      <span class="neural-msg-time">
        {new Date(props.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}

function MessageAction(props: {
  directive?: NeuralDirective;
  onExecute: (d: NeuralDirective) => void;
}) {
  return (
    <Show when={props.directive}>
      {(dir) => (
        <div class="neural-msg-action">
          <button
            type="button"
            class="neural-action-btn mono"
            onClick={() => props.onExecute(dir())}
          >
            <span class="action-icon">⚡</span>
            <span>EXECUTE: {dir().label}</span>
          </button>
        </div>
      )}
    </Show>
  );
}

function MessageFollowups(props: {
  followUps?: string[];
  onSelect: (q: string) => void;
}) {
  const hasFollowups = () =>
    Boolean(props.followUps && props.followUps.length > 0);

  return (
    <Show when={hasFollowups()}>
      <div class="neural-followups">
        <span class="neural-followups-label mono">SUGGESTED SYNAPSES:</span>
        <div class="neural-chips">
          <For each={props.followUps}>
            {(chip) => (
              <button
                type="button"
                class="neural-chip mono"
                onClick={() => props.onSelect(chip)}
              >
                {chip} →
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

export default function NeuralMessageItem(props: NeuralMessageItemProps) {
  const msgClass = () =>
    props.message.role === "user"
      ? "neural-msg neural-msg-user"
      : "neural-msg neural-msg-assistant";

  return (
    <div class={msgClass()}>
      <MessageHeader
        role={props.message.role}
        timestamp={props.message.timestamp}
      />
      <div class="neural-msg-body">
        <pre class="neural-msg-text mono">{props.message.content}</pre>
        <Show when={props.message.isStreaming}>
          <span class="neural-cursor blink">█</span>
        </Show>
      </div>
      <MessageAction
        directive={props.message.directive}
        onExecute={props.onExecuteDirective}
      />
      <MessageFollowups
        followUps={props.message.followUps}
        onSelect={props.onSelectQuery}
      />
    </div>
  );
}
