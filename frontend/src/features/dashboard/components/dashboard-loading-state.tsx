import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export function DashboardLoadingState() {
  return (
    <DashboardShell mode="single">
      <Card className="p-8">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </Card>
    </DashboardShell>
  );
}
