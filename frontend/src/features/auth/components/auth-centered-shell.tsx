import type { ReactNode } from "react";

type AuthCenteredShellProps = {
  children: ReactNode;
};

export function AuthCenteredShell({ children }: AuthCenteredShellProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-10">
      {children}
    </main>
  );
}
