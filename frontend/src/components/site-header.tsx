"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { logout } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "@/components/brand-mark";
import { appConfig } from "@/lib/app-config";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const activeHref =
    pathname === "/" || pathname === "/dashboard" ? pathname : "";
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { user, isLoading } = useAuthSession();

  function handleLogout() {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      void logout({ refresh_token: refreshToken }).catch(() => null);
    }
    clearSession();
    void queryClient.invalidateQueries({ queryKey: ["auth"] });
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight">
            {appConfig.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeHref === item.href && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-muted-foreground text-sm">
                {user.full_name || user.username}
              </span>
              <Button type="button" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : isLoading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
