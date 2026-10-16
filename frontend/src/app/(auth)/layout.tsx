import type { ReactNode } from "react";
import { RouteAreaShell } from "@/layouts/route-area-shell";

type AuthGroupLayoutProps = {
  children: ReactNode;
};

export default function AuthGroupLayout({ children }: AuthGroupLayoutProps) {
  return <RouteAreaShell tone="auth">{children}</RouteAreaShell>;
}
