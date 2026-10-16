"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 py-10">
      <section className="grid w-full gap-4 rounded-xl border p-8">
        <Badge variant="destructive" className="w-fit">
          App Error
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Something broke, but the template is recoverable.
        </h1>
        <p className="text-muted-foreground">
          This is a built-in error boundary for unexpected runtime failures. You
          can customize it per project.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.assign("/")}
          >
            Go home
          </Button>
        </div>
      </section>
    </main>
  );
}
