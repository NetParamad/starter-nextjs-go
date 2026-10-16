import { Blocks, DatabaseZap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickFacts = [
  "Next.js + Go foundation",
  "Auth and dashboard included",
  "Flexible sections ready to adapt",
  "Simple to customize",
];

const starterHighlights = [
  {
    title: "Reusable interface",
    description:
      "A polished frontend shell you can reshape without starting the design system from zero.",
    Icon: Blocks,
  },
  {
    title: "Backend already wired",
    description:
      "Routes, data access, and protected flows are in place so the app feels connected from day one.",
    Icon: DatabaseZap,
  },
  {
    title: "Safer private flows",
    description:
      "Login, owner access, and account recovery patterns are already present when your product needs them.",
    Icon: ShieldCheck,
  },
];

export function WhyChooseSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {quickFacts.map((fact) => (
          <Badge key={fact} variant="outline">
            {fact}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {starterHighlights.map(({ title, description, Icon }) => (
          <Card key={title}>
            <CardHeader>
              <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
