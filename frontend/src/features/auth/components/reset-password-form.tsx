"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSplitShell } from "@/features/auth/components/auth-split-shell";
import { resetPassword } from "@/features/auth/services/auth-service";

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error(
          "Missing reset token. Please reopen the link from your email.",
        );
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match yet.");
      }

      return resetPassword({
        token,
        password,
      });
    },
    onSuccess: () => {
      setSuccessMessage(
        "Your password has been reset. Redirecting you to login...",
      );
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to reset password.",
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    mutation.mutate();
  };

  return (
    <AuthSplitShell
      badge="Password Reset"
      heading="Create a new password to regain access."
      description="This page keeps basic validation while staying ready for your own backend rules."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Create new password</CardTitle>
          <CardDescription>
            Use a strong password that you can manage yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              Reset password
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </form>
          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {successMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </AuthSplitShell>
  );
}
