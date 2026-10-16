"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useUiStore } from "@/features/shared/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { user, isLoading } = useAuthSession();

  function handleLogout() {
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
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="grid gap-4 pt-8">
                <div className="grid gap-1.5">
                  <Badge variant="outline" className="w-fit">
                    Quick Navigation
                  </Badge>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Explore {appConfig.name}
                  </h2>
                </div>
                <nav className="grid gap-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          activeHref === item.href ? "page" : undefined
                        }
                        className={cn(
                          "hover:bg-accent rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          activeHref === item.href
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="grid gap-2 pt-2">
                  {user ? (
                    <>
                      <p className="text-muted-foreground px-1 text-sm">
                        Signed in as {user.full_name || user.username}
                      </p>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline">
                          <Link href="/login">Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild>
                          <Link href="/signup">Sign up</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
