import { ReactNode } from "react";
import { RouteContentFrame } from "@/components/route-content-frame";
import { Providers } from "@/components/providers";
import { RouteScrollReset } from "@/components/route-scroll-reset";
import { SiteHeader } from "@/components/site-header";

type RootShellProps = {
  children: ReactNode;
};

export function RootShell({ children }: RootShellProps) {
  return (
    <Providers>
      <div className="bg-background relative flex min-h-screen flex-col">
        <RouteScrollReset />
        <a
          href="#main-content"
          className="focus:bg-background sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div className="flex-1">
          <RouteContentFrame>{children}</RouteContentFrame>
        </div>
      </div>
    </Providers>
  );
}
