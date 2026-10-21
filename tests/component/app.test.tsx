import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import App from "../../src/App";

describe("Toille Neural Core App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders application header and title", () => {
    const { getByRole, getByText } = render(() => <App />);

    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByText(/\[NEURAL CORE\]/i)).toBeInTheDocument();
    expect(getByText(/ED-AI v2.8/i)).toBeInTheDocument();
  });

  it("renders input form and transmit button", () => {
    const { getByRole, getByPlaceholderText } = render(() => <App />);

    expect(
      getByRole("button", { name: /Transmit query/i }),
    ).toBeInTheDocument();
    expect(getByPlaceholderText(/Ask ED-AI/i)).toBeInTheDocument();
  });

  it("handles query typing and form submission", async () => {
    const { getByRole, getByPlaceholderText } = render(() => <App />);
    const input = getByPlaceholderText(/Ask ED-AI/i) as HTMLInputElement;
    const submitBtn = getByRole("button", { name: /Transmit query/i });

    fireEvent.input(input, { target: { value: "What is your stack?" } });
    expect(input.value).toBe("What is your stack?");

    fireEvent.click(submitBtn);
    expect(input.value).toBe("");
  });
});
