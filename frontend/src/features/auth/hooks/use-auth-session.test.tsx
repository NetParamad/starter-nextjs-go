import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "./use-auth-session";
import { useAuthStore } from "../store/auth-store";
import type { AuthUser } from "@/types/auth";

vi.mock("../services/auth-service", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../services/auth-service")>();
  return {
    ...original,
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
  };
});

const { getCurrentUser, refreshSession } =
  await import("../services/auth-service");

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedRefreshSession = vi.mocked(refreshSession);

const demoUser = {
  id: "user-1",
  username: "demo",
  email: "demo@nextjs-go.local",
} as AuthUser;

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function seedSession(session: { refreshToken?: string | null }) {
  useAuthStore.setState({
    accessToken: "expired-access-token",
    expiresAt: new Date(Date.now() - 1000).toISOString(),
    refreshToken: "refresh-token",
    user: null,
    ...session,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clearSession();
});

describe("useAuthSession silent renew", () => {
  it("rotates to a fresh session when the access token is rejected", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));
    mockedRefreshSession.mockResolvedValue({
      accessToken: "fresh-access-token",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      refreshToken: "fresh-refresh-token",
      user: demoUser,
    });

    seedSession({});

    renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe("fresh-access-token");
    });
    expect(mockedRefreshSession).toHaveBeenCalledWith({
      refresh_token: "refresh-token",
    });
    expect(useAuthStore.getState().refreshToken).toBe("fresh-refresh-token");
  });

  it("clears the session when renewal fails", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));
    mockedRefreshSession.mockRejectedValue(new Error("expired"));

    seedSession({});

    renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it("clears immediately when there is no refresh token", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

    seedSession({ refreshToken: null });

    renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
    expect(mockedRefreshSession).not.toHaveBeenCalled();
  });
});
