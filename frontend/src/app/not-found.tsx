import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 py-10">
      <section className="grid w-full gap-4 rounded-xl border p-8 text-center">
        <Badge variant="secondary" className="mx-auto w-fit">
          Not Found
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          The page you asked for is not part of this starter.
        </h1>
        <p className="text-muted-foreground">
          Use this screen as your default 404 state, or reshape it for your own
          product voice and support flow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Open login</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
