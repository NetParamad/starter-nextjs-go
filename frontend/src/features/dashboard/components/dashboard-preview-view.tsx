import { BarChart3, Eye, LockKeyhole, UserRound } from "lucide-react";
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

type DashboardPreviewViewProps = {
  ownerEmail: string;
};

const previewSessionRows = [
  { label: "Name", value: "Owner Preview" },
  { label: "Email", value: "owner@your-product.com" },
  { label: "Role", value: "owner" },
  { label: "Member Since", value: "Jan 16, 2026" },
];

const previewAnalytics = [
  { label: "Visitors", value: "12.4k" },
  { label: "Pageviews", value: "28.9k" },
  { label: "Views / Visit", value: "2.3" },
  { label: "Bounce Rate", value: "34%" },
  { label: "Visit Duration", value: "3m 42s" },
  { label: "Window", value: "Last 30 days", note: "Sample preview data" },
];

export function DashboardPreviewView({
  ownerEmail,
}: DashboardPreviewViewProps) {
  return (
    <DashboardShell>
      <DashboardHero
        badge="Dashboard Preview"
        title="Preview the private workspace before wiring login."
        description={
          <p>
            This public version shows the shape of the dashboard so people can
            explore the starter before they touch auth. Sign in as the
            configured owner account to unlock live session data and real
            analytics.
          </p>
        }
        secondaryHref="/"
        secondaryLabel="Back home"
        primaryHref="/login"
        primaryLabel="Open auth demo"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Preview User</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="text-muted-foreground h-5 w-5" />
              Owner Preview
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Access Mode</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="text-muted-foreground h-5 w-5" />
              Public demo
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unlocks With</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LockKeyhole className="text-muted-foreground h-5 w-5" />
              Owner login
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
            <CardDescription>
              A preview of the private account context this workspace can expose
              once auth is wired for real users.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4">
              {previewSessionRows.map((item) => (
                <div key={item.label} className="grid gap-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-semibold">
                What the real owner dashboard unlocks
              </p>
              <ul className="text-muted-foreground mt-2 grid list-disc gap-1 pl-5 text-sm">
                <li>Authenticated session hydration for the signed-in owner</li>
                <li>Owner-only route protection on the frontend and backend</li>
                <li>Live analytics from the protected backend endpoint</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitors Analytics</CardTitle>
            <CardDescription>
              Sample numbers for the public preview. The real route becomes live
              after owner authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {previewAnalytics.map((item) => (
                <div key={item.label} className="rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{item.value}</p>
                  {"note" in item && item.note ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-muted-foreground h-5 w-5" />
                <p className="text-sm font-semibold">
                  Switches to real analytics when the owner signs in
                </p>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {ownerEmail
                  ? `The configured owner email is ${ownerEmail}. Signing in with that account replaces this preview with the real protected analytics view.`
                  : "Set NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL and sign in with that account to replace this preview with the real protected analytics view."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
