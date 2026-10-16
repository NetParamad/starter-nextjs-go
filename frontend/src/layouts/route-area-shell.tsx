import type { ReactNode } from "react";

type RouteAreaTone = "site" | "auth" | "workspace";

type RouteAreaShellProps = {
  tone: RouteAreaTone;
  children: ReactNode;
};

export function RouteAreaShell({ children }: RouteAreaShellProps) {
  return <section className="relative">{children}</section>;
}
