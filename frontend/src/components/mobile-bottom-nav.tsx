"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { logout } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { user } = useAuthSession();

  function handleLogout() {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      void logout({ refresh_token: refreshToken }).catch(() => null);
    }
    clearSession();
    void queryClient.invalidateQueries({ queryKey: ["auth"] });
  }

  const linkClassName = (href: string) =>
    cn(
      "text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-colors",
      pathname === href && "text-foreground",
    );

  return (
    <nav
      aria-label="Mobile"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
    >
      <div className="flex items-stretch gap-1 px-3 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={linkClassName("/")}
        >
          <House className="h-5 w-5" />
          Home
        </Link>
        <Link
          href="/dashboard"
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          className={linkClassName("/dashboard")}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            aria-current={pathname === "/login" ? "page" : undefined}
            className={linkClassName("/login")}
          >
            <LogIn className="h-5 w-5" />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
