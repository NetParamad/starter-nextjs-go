import { Blocks, DatabaseZap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteCopy } from "@/lib/site-copy";

const cardIcons = {
  interface: Blocks,
  backend: DatabaseZap,
  private: ShieldCheck,
} as const;

export function WhyChooseSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {siteCopy.why.facts.map((fact) => (
          <Badge key={fact} variant="outline">
            {fact}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {siteCopy.why.cards.map(({ key, title, description }) => {
          const Icon = cardIcons[key];
          return (
            <Card key={key}>
              <CardHeader>
                <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
