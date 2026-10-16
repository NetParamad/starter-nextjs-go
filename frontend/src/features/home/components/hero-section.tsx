import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/app-config";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
      <Badge variant="secondary">Full-stack starter</Badge>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
        Build your next product from a solid full-stack base.
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg">
        {appConfig.name} gives you a clean starting surface with a Next.js
        frontend, Go API, account flows, and adaptable product patterns that are
        ready to become your own experience.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard">Open dashboard preview</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </section>
  );
}
