import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);

    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("applies the destructive variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);

    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "bg-destructive",
    );
  });

  it("forwards clicks unless disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click me" }));
    expect(onClick).toHaveBeenCalledOnce();

    const disabledClick = vi.fn();
    render(
      <Button disabled onClick={disabledClick}>
        Blocked
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Blocked" }));
    expect(disabledClick).not.toHaveBeenCalled();
  });

  it("renders as a child link with asChild", () => {
    render(
      <Button asChild>
        <a href="/login">Login</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Login" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
