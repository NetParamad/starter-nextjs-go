import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/app-config";
import { siteCopy } from "@/lib/site-copy";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
      <Badge variant="secondary">{siteCopy.hero.badge}</Badge>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
        {siteCopy.hero.title}
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg">
        {appConfig.name} {siteCopy.hero.lead}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href={siteCopy.hero.primary.href}>
            {siteCopy.hero.primary.label}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={siteCopy.hero.secondary.href}>
            {siteCopy.hero.secondary.label}
          </Link>
        </Button>
      </div>
    </section>
  );
}
