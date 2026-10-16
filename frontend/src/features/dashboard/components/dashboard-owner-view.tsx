import type { UseQueryResult } from "@tanstack/react-query";
import { Clock3, Eye, ShieldCheck, UserRound } from "lucide-react";
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
import type { AnalyticsOverview } from "@/types/analytics";
import type { AuthUser } from "@/types/auth";

type DashboardOwnerViewProps = {
  analyticsQuery: UseQueryResult<AnalyticsOverview, Error>;
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

export function DashboardOwnerView({
  analyticsQuery,
  user,
}: DashboardOwnerViewProps) {
  const displayName = user.full_name || user.username;

  const analyticsCards = analyticsQuery.data
    ? [
        { label: "Visitors", value: analyticsQuery.data.visitors },
        { label: "Pageviews", value: analyticsQuery.data.pageviews },
        { label: "Views / Visit", value: analyticsQuery.data.views_per_visit },
        { label: "Bounce Rate", value: analyticsQuery.data.bounce_rate },
        { label: "Visit Duration", value: analyticsQuery.data.visit_duration },
        {
          label: "Window",
          note: analyticsQuery.data.source,
          value: analyticsQuery.data.date_range,
        },
      ]
    : [];

  return (
    <DashboardShell>
      <DashboardHero
        badge="Owner Dashboard"
        title="Review owner access, account context, and analytics from one private workspace."
        description={
          <p>
            This dashboard keeps the private account layer and analytics view
            intact without surfacing the removed sample content management
            flows.
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
              The current owner session context available to the app shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4">
              <div className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Name
                </p>
                <p className="text-sm">{displayName}</p>
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
              <p className="text-sm font-semibold">
                What this dashboard still demonstrates
              </p>
              <ul className="text-muted-foreground mt-2 grid list-disc gap-1 pl-5 text-sm">
                <li>Owner-only route protection on the frontend and backend</li>
                <li>Authenticated session hydration for the signed-in user</li>
                <li>A private analytics surface wired through the Go API</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitors Analytics</CardTitle>
            <CardDescription>
              Real traffic numbers from the protected analytics backend
              endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {analyticsQuery.isError ? (
              <p className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
                {analyticsQuery.error instanceof Error
                  ? analyticsQuery.error.message
                  : "Failed to load analytics."}
              </p>
            ) : null}
            {analyticsQuery.isLoading ? (
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Loading analytics overview...
                </p>
              </div>
            ) : analyticsQuery.data ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {analyticsCards.map((card) => (
                  <div key={card.label} className="rounded-lg border p-4">
                    <p className="text-muted-foreground text-xs tracking-wide uppercase">
                      {card.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{card.value}</p>
                    {card.note ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {card.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Eye className="text-muted-foreground h-5 w-5" />
                  <p className="font-semibold">
                    Analytics is not configured yet.
                  </p>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Configure the Plausible tracking script in the frontend and
                  the Plausible API credentials in the backend to start seeing
                  live visitor numbers here.
                </p>
              </div>
            )}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-semibold">
                What you can already see now
              </p>
              <ul className="text-muted-foreground mt-2 grid list-disc gap-1 pl-5 text-sm">
                <li>
                  Real visitor, pageview, bounce-rate, and duration numbers when
                  Plausible is configured
                </li>
                <li>Whether the owner-only backend route is wired correctly</li>
                <li>
                  Whether your frontend and backend environment config align
                </li>
              </ul>
            </div>
            <p className="text-muted-foreground text-xs">
              The analytics API key stays on the backend only. The dashboard
              fetches aggregated stats through your authenticated owner-only
              backend route.
            </p>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
