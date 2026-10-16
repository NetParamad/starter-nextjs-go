import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { featuredHighlights } from "@/lib/site-data";

const landingHighlights = [
  {
    step: "01",
    title: "Focused first impression",
    description: "Clear hero copy with one dominant action path.",
  },
  {
    step: "02",
    title: "Ready to expand",
    description:
      "Supporting sections hint at the system now and can grow into a fuller marketing page later.",
  },
];

export function AboutSection() {
  const featuredCards = featuredHighlights.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16" id="about">
      <div className="mx-auto mb-10 grid max-w-2xl gap-3 text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Why it lands well
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Focused on first impression, but still grounded in real product
          structure.
        </h2>
        <p className="text-muted-foreground">
          This home page keeps centered clarity, then adds product framing and
          reusable content blocks so the starter still feels useful once you
          begin customizing it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {landingHighlights.map(({ step, title, description }) => (
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
