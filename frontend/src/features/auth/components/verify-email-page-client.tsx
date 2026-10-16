"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MailCheck, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthSplitShell } from "@/features/auth/components/auth-split-shell";
import { verifyEmail } from "@/features/auth/services/auth-service";

type VerifyEmailPageClientProps = {
  token?: string;
};

export function VerifyEmailPageClient({ token }: VerifyEmailPageClientProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const hasTriggeredVerification = useRef(false);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error(
          "Missing verification token. Please reopen the link from your email.",
        );
      }

      return verifyEmail({ token });
    },
    onSuccess: () => {
      setStatusMessage("Your email is verified. Redirecting you to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to verify email.",
      );
    },
  });

  useEffect(() => {
    if (token && !hasTriggeredVerification.current) {
      hasTriggeredVerification.current = true;
      verifyMutation.mutate();
    }
  }, [token, verifyMutation]);

  return (
    <AuthSplitShell
      badge="Email Verification"
      heading="Confirm your email so your account is ready to use."
      description="We only activate new accounts after the owner proves they can open the inbox tied to the email address."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Verifying your email</CardTitle>
          <CardDescription>
            We are confirming your verification token now.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {statusMessage ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              {statusMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
              {errorMessage}
            </p>
          ) : null}

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              {verifyMutation.isPending ? (
                <MailCheck className="text-muted-foreground h-5 w-5" />
              ) : errorMessage ? (
                <ShieldAlert className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <p className="text-sm font-semibold">
                {verifyMutation.isPending
                  ? "Confirming your email..."
                  : "Verification status updated."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthSplitShell>
  );
}
