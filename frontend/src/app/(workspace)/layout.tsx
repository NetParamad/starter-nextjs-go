import type { ReactNode } from "react";
import { RouteAreaShell } from "@/layouts/route-area-shell";

type WorkspaceGroupLayoutProps = {
  children: ReactNode;
};

export default function WorkspaceGroupLayout({
  children,
}: WorkspaceGroupLayoutProps) {
  return <RouteAreaShell tone="workspace">{children}</RouteAreaShell>;
}
