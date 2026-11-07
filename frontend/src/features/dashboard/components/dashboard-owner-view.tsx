import { Clock3, CheckCircle2, ShieldCheck, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DashboardHero,
  DashboardShell,
} from "@/features/dashboard/components/dashboard-shell";
import type { AuthUser } from "@/types/auth";

type DashboardOwnerViewProps = {
  user: AuthUser;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DashboardOwnerView({ user }: DashboardOwnerViewProps) {
  const displayName = user.full_name || user.username;

  return (
    <DashboardShell>
      <DashboardHero
        badge="Owner Dashboard"
        title="Review owner access, account context, and analytics from one private workspace."
        description={
          <p>
            Welcome to your private dashboard. This workspace is protected by
            JWT authentication connected to the Go backend.
          </p>
        }
        secondaryHref="/"
        secondaryLabel="Back home"
        primaryHref="/login"
        primaryLabel="Open login screen"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Signed In As</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="text-muted-foreground h-5 w-5" />
              {displayName}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Account Status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="text-muted-foreground h-5 w-5" />
              {user.status}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Last Login</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock3 className="text-muted-foreground h-5 w-5" />
              {formatDate(user.last_login_at)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
            <CardDescription>
              The current authenticated session context from the Go API.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4">
              <div className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Name
                </p>
                <p className="text-sm font-semibold">{displayName}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Email
                </p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Role
                  </p>
                  <p className="text-sm">{user.role}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Member Since
                  </p>
                  <p className="text-sm">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-semibold">Starter Features</p>
              <ul className="text-muted-foreground mt-2 grid list-disc gap-1 pl-5 text-sm">
                <li>Authenticated session persistence across page refreshes</li>
                <li>Single-use refresh token rotation in PostgreSQL</li>
                <li>Next.js App Router frontend with Go API backend</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System & API Status</CardTitle>
            <CardDescription>
              Full-stack connectivity verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold">API Backend Connected</p>
                <p className="text-muted-foreground text-xs">
                  Your Next.js client is communicating securely with Go.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border p-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Frontend</span>
                <span className="font-medium">Next.js 16 (App Router)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Backend API</span>
                <span className="font-medium">Go 1.25 Standard Library</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium">PostgreSQL (pgx pool)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authentication</span>
                <span className="font-medium">JWT (Access + Refresh)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
