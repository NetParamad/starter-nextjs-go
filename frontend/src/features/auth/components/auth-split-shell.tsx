import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type AuthSplitShellProps = {
  badge: string;
  heading: string;
  description: string;
  children: ReactNode;
};

export function AuthSplitShell({
  badge,
  heading,
  description,
  children,
}: AuthSplitShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      <section className="bg-muted hidden flex-col justify-center gap-4 rounded-xl p-10 lg:flex">
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
        <h1 className="max-w-md text-4xl font-bold tracking-tight text-balance">
          {heading}
        </h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </section>

      <div className="flex items-center justify-center">{children}</div>
    </main>
  );
}
