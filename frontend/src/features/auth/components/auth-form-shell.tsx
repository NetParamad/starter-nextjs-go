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
import { login, register } from "@/features/auth/services/auth-service";
import {
  loginSchema,
  registerSchema,
} from "@/features/auth/schemas/auth-schemas";
import { AuthSplitShell } from "@/features/auth/components/auth-split-shell";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { appConfig } from "@/lib/app-config";
import type { AuthSession } from "@/types/auth";

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
  mode: "login" | "signup";
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
      if (mode === "login") {
        const parsed = loginSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
        });
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message || "Invalid input");
        }
        return login(parsed.data);
      }

      const parsed = registerSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
        full_name: formData.get("full_name") || undefined,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Invalid input");
      }
      return register({
        username: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
        full_name: parsed.data.full_name || "",
      });
    },
    onSuccess: async (result) => {
      setErrorMessage("");

      if (mode === "signup") {
        setSuccessMessage("Account created successfully! You can now log in.");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
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
