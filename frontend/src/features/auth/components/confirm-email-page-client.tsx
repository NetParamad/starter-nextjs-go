"use client";

import Link from "next/link";
import { MailCheck, RefreshCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthCenteredShell } from "@/features/auth/components/auth-centered-shell";
import { resendVerification } from "@/features/auth/services/auth-service";

type ConfirmEmailPageClientProps = {
  email?: string;
};

export function ConfirmEmailPageClient({ email }: ConfirmEmailPageClientProps) {
  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("Email address is missing for resend verification.");
      }

      return resendVerification({ email });
    },
  });

  return (
    <AuthCenteredShell>
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
          <CardDescription>
            {email
              ? `Kami sudah mengirim email verifikasi ke ${email}. Silakan cek Gmail kamu lalu klik link verifikasinya sebelum login.`
              : "Kami sudah mengirim email verifikasi. Silakan cek Gmail kamu lalu klik link verifikasinya sebelum login."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {resendMutation.isSuccess ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              Email verifikasi sudah dikirim ulang. Cek inbox atau folder spam
              kamu.
            </p>
          ) : null}
          {resendMutation.isError ? (
            <p className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
              {resendMutation.error instanceof Error
                ? resendMutation.error.message
                : "Gagal mengirim ulang email verifikasi."}
            </p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => resendMutation.mutate()}
            disabled={!email || resendMutation.isPending}
          >
            <RefreshCcw className="h-4 w-4" />
            Resend verification
          </Button>

          <Button asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthCenteredShell>
  );
}
