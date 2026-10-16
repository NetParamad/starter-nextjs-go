import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardTone = "default" | "brand" | "accent";

const toneClassNames: Record<StatCardTone, string> = {
  default: "",
  brand: "border-primary/20 bg-primary/[0.03]",
  accent: "bg-accent/50",
};

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: StatCardTone;
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { className, label, value, hint, icon, tone = "default", ...props },
    ref,
  ) => (
    <Card ref={ref} className={cn(toneClassNames[tone], className)} {...props}>
      <CardContent className="grid gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <p className="text-muted-foreground text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {icon ? (
            <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
      </CardContent>
    </Card>
  ),
);

StatCard.displayName = "StatCard";

export { StatCard };
