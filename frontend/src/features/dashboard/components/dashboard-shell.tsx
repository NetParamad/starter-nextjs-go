import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  mode?: "grid" | "single";
};

type DashboardHeroProps = {
  badge: string;
  description: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  title: ReactNode;
};

const baseShellClassName = "mx-auto w-full max-w-6xl px-4 py-8";

export function DashboardShell({
  children,
  mode = "grid",
}: DashboardShellProps) {
  return (
    <main className={cn(baseShellClassName, mode === "grid" && "grid gap-6")}>
      {children}
    </main>
  );
}

export function DashboardHero({
  badge,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: DashboardHeroProps) {
  return (
    <section className="rounded-xl border p-8 md:p-10">
      <div className="grid max-w-2xl gap-4">
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <div className="text-muted-foreground">{description}</div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
          <Button asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
