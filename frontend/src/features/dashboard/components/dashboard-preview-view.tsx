import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export function DashboardPreviewView() {
  return (
    <DashboardShell>
      <Card className="mx-auto max-w-2xl text-center">
        <CardHeader className="gap-2">
          <Badge variant="secondary" className="mx-auto w-fit">
            Public demo
          </Badge>
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            Preview the private workspace before wiring login.
          </CardTitle>
          <CardDescription className="text-base">
            This dashboard is protected. Sign in with your account to access the
            authenticated session details and private workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/login">Open login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
