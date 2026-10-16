"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap";
import { getQueryClient } from "@/features/shared/api/query-client";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
