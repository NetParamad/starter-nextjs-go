import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteCopy } from "@/lib/site-copy";

export function AboutSection() {
  const featuredCards = siteCopy.featuredHighlights.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16" id="about">
      <div className="mx-auto mb-10 grid max-w-2xl gap-3 text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          {siteCopy.about.eyebrow}
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {siteCopy.about.title}
        </h2>
        <p className="text-muted-foreground">{siteCopy.about.lead}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {siteCopy.about.highlights.map(({ step, title, description }) => (
          <Card key={step}>
            <CardHeader>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {step}
              </p>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        {featuredCards.map((highlight, index) => (
          <Card key={highlight.title}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-1.5">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {highlight.category}
                  </p>
                  <CardTitle>{highlight.title}</CardTitle>
                  <CardDescription>{highlight.description}</CardDescription>
                </div>
                <span className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-sm font-semibold">
                  0{index + 1}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
