"use client";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useDashboardPageState() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { user, isLoading } = useAuthSession();

  return {
    accessToken,
    clearSession,
    isLoading,
    isAuthenticated: Boolean(user),
    user,
  };
}
