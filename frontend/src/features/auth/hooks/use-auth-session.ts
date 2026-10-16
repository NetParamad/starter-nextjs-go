"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getCurrentUser,
  refreshSession,
} from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useAuthSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const refreshAttempted = useRef(false);

  const query = useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: () => getCurrentUser(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    refreshAttempted.current = false;
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    // The access token was rejected: try one silent rotation before
    // giving up. A rotated (single-use) token fails closed, so this
    // cannot loop forever.
    if (refreshToken && !refreshAttempted.current) {
      refreshAttempted.current = true;
      refreshSession({ refresh_token: refreshToken })
        .then(setSession)
        .catch(() => clearSession());
      return;
    }

    clearSession();
  }, [query.isError, refreshToken, setSession, clearSession]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    // With no refresh token available, an expired access token is final.
    // Otherwise the /me query fails closed and the effect above renews.
    if (!refreshToken && new Date(expiresAt).getTime() <= Date.now()) {
      clearSession();
    }
  }, [clearSession, expiresAt, refreshToken]);

  return {
    accessToken,
    user,
    isLoading: Boolean(accessToken) && query.isLoading,
  };
}
