import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import NeuralMessageItem from "../../src/lib/components/neural/NeuralMessageItem";
import type { ChatMessage, NeuralDirective } from "../../src/lib/neural/types";

describe("NeuralMessageItem Component", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders user message with human prompt header and content", () => {
    const message: ChatMessage = {
      id: "msg-1",
      role: "user",
      content: "Tell me about RM Assessments architecture",
      timestamp: 1700000000000,
    };

    const { getByText } = render(() => (
      <NeuralMessageItem
        message={message}
        onSelectQuery={vi.fn()}
        onExecuteDirective={vi.fn()}
      />
    ));

    expect(getByText("// HUMAN PROMPT")).toBeInTheDocument();
    expect(
      getByText("Tell me about RM Assessments architecture"),
    ).toBeInTheDocument();
  });

  it("renders assistant message with synapse header and formatted timestamp", () => {
    const message: ChatMessage = {
      id: "msg-2",
      role: "assistant",
      content: "ED-AI Core response text",
      timestamp: 1700000000000,
    };

    const { getByText } = render(() => (
      <NeuralMessageItem
        message={message}
        onSelectQuery={vi.fn()}
        onExecuteDirective={vi.fn()}
      />
    ));

    expect(getByText("// ED-AI SYNAPSE")).toBeInTheDocument();
    expect(getByText("ED-AI Core response text")).toBeInTheDocument();
  });

  it("renders streaming cursor indicator when isStreaming is true", () => {
    const message: ChatMessage = {
      id: "msg-3",
      role: "assistant",
      content: "Streaming chunk...",
      isStreaming: true,
      timestamp: Date.now(),
    };

    const { getByText } = render(() => (
      <NeuralMessageItem
        message={message}
        onSelectQuery={vi.fn()}
        onExecuteDirective={vi.fn()}
      />
    ));

    expect(getByText("█")).toBeInTheDocument();
  });

  it("renders directive execute button and triggers onExecuteDirective on click", async () => {
    const directive: NeuralDirective = {
      type: "racer",
      label: "LAUNCH CYBERRACER",
    };
    const message: ChatMessage = {
      id: "msg-4",
      role: "assistant",
      content: "Ready to launch engine",
      directive,
      timestamp: Date.now(),
    };
    const onExecuteDirective = vi.fn();

    const { getByRole } = render(() => (
      <NeuralMessageItem
        message={message}
        onSelectQuery={vi.fn()}
        onExecuteDirective={onExecuteDirective}
      />
    ));

    const btn = getByRole("button", { name: /EXECUTE: LAUNCH CYBERRACER/i });
    expect(btn).toBeInTheDocument();

    await fireEvent.click(btn);
    expect(onExecuteDirective).toHaveBeenCalledWith(directive);
  });

  it("renders suggested follow-up chips and triggers onSelectQuery on click", async () => {
    const message: ChatMessage = {
      id: "msg-5",
      role: "assistant",
      content: "Explore further:",
      followUps: ["Core Skills", "Cyberdeck Audio"],
      timestamp: Date.now(),
    };
    const onSelectQuery = vi.fn();

    const { getByRole } = render(() => (
      <NeuralMessageItem
        message={message}
        onSelectQuery={onSelectQuery}
        onExecuteDirective={vi.fn()}
      />
    ));

    const chip1 = getByRole("button", { name: /Core Skills →/i });
    const chip2 = getByRole("button", { name: /Cyberdeck Audio →/i });
    expect(chip1).toBeInTheDocument();
    expect(chip2).toBeInTheDocument();

    await fireEvent.click(chip1);
    expect(onSelectQuery).toHaveBeenCalledWith("Core Skills");
  });
});
