import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useAuthStore } from "../features/auth/store/auth-store";
import type { AuthUser } from "@/types/auth";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

const demoUser = {
  id: "user-1",
  username: "demo",
  email: "demo@nextjs-go.local",
} as AuthUser;

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  useAuthStore.getState().clearSession();
});

describe("MobileBottomNav", () => {
  it("links guests to login", () => {
    render(<MobileBottomNav />, { wrapper: Wrapper });

    const login = screen.getByRole("link", { name: "Login" });
    expect(login).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("logs the user out and clears the session", () => {
    useAuthStore.setState({ user: demoUser });
    render(<MobileBottomNav />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(useAuthStore.getState().user).toBeNull();
  });
});
