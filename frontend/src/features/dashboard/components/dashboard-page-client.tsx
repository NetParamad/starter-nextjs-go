"use client";

import { DashboardLoadingState } from "@/features/dashboard/components/dashboard-loading-state";
import { DashboardOwnerView } from "@/features/dashboard/components/dashboard-owner-view";
import { DashboardPreviewView } from "@/features/dashboard/components/dashboard-preview-view";
import { useDashboardPageState } from "@/features/dashboard/hooks/use-dashboard-page-state";

export function DashboardPageClient() {
  const { isLoading, user } = useDashboardPageState();

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return <DashboardPreviewView />;
  }

  return <DashboardOwnerView user={user} />;
}
