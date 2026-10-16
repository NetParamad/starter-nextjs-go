import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModeToggle } from "./mode-toggle";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

async function mockResolvedTheme(theme: string | undefined) {
  const { useTheme } = await import("next-themes");
  vi.mocked(useTheme).mockReturnValue({
    resolvedTheme: theme,
    setTheme,
  } as unknown as ReturnType<typeof useTheme>);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ModeToggle", () => {
  it("switches to dark mode from light", async () => {
    await mockResolvedTheme("light");

    render(<ModeToggle />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches to light mode from dark", async () => {
    await mockResolvedTheme("dark");

    render(<ModeToggle />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
