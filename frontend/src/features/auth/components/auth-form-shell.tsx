"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  forgotPassword,
  login,
  register,
} from "@/features/auth/services/auth-service";
import { AuthSplitShell } from "@/features/auth/components/auth-split-shell";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { appConfig } from "@/lib/app-config";
import type { AuthSession, RegisterResponse } from "@/types/auth";

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
};

type SecondaryLink = {
  href: string;
  label: string;
};

type AuthFormShellProps = {
  mode: "login" | "signup" | "forgot-password";
  title: string;
  description: string;
  submitLabel: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  fields: Field[];
  secondaryLink?: SecondaryLink;
};

export function AuthFormShell({
  mode,
  title,
  description,
  submitLabel,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  fields,
  secondaryLink,
}: AuthFormShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (mode === "forgot-password") {
        return forgotPassword({
          email: String(formData.get("email") ?? ""),
        });
      }

      if (mode === "login") {
        return login({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      }

      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirm_password") ?? "");
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      return register({
        username: String(formData.get("username") ?? ""),
        email: String(formData.get("email") ?? ""),
        password,
        full_name: String(formData.get("full_name") ?? ""),
      });
    },
    onSuccess: async (result) => {
      setErrorMessage("");

      if (mode === "forgot-password") {
        setSuccessMessage(
          "If your email is registered, a reset link will be sent there.",
        );
        return;
      }

      if (mode === "signup") {
        const email = (result as RegisterResponse).user.email;
        router.push(
          `/confirm-email${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        );
        router.refresh();
        return;
      }

      setSession(result as AuthSession);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");

    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <AuthSplitShell
      badge="Starter auth"
      heading="Reusable account flows, ready to adapt."
      description="A clean auth surface with reusable structure, clear states, and backend-ready patterns you can reshape for your own product."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {mode === "login" &&
          appConfig.demo.email &&
          appConfig.demo.password ? (
            <div className="bg-muted rounded-lg px-4 py-3 text-sm">
              <p className="font-semibold">Demo account</p>
              <p className="mt-1">
                Email: <code>{appConfig.demo.email}</code>
              </p>
              <p className="mt-1">
                Password: <code>{appConfig.demo.password}</code>
              </p>
            </div>
          ) : null}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            {errorMessage ? (
              <p className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
                {errorMessage}
              </p>
            ) : null}
            {successMessage ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {submitLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {secondaryLink ? (
                <Link
                  href={secondaryLink.href}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  {secondaryLink.label}
                </Link>
              ) : null}
            </div>
          </form>
          <p className="text-muted-foreground mt-1 text-sm">
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="text-primary font-medium hover:underline"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitShell>
  );
}
