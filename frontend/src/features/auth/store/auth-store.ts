"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  expiresAt: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
};

function syncSessionCookie(active: boolean) {
  if (typeof document === "undefined") {
    return;
  }
  if (active) {
    document.cookie =
      "app_session=active; path=/; max-age=2592000; SameSite=Lax";
  } else {
    document.cookie = "app_session=; path=/; max-age=0; SameSite=Lax";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      refreshToken: null,
      user: null,
      setSession: (session) => {
        syncSessionCookie(true);
        set({
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          refreshToken: session.refreshToken,
          user: session.user,
        });
      },
      setUser: (user) => set({ user }),
      clearSession: () => {
        syncSessionCookie(false);
        set({
          accessToken: null,
          expiresAt: null,
          refreshToken: null,
          user: null,
        });
      },
    }),
    {
      name: "app_auth_session",
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
