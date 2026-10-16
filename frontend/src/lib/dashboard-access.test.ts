import { afterEach, describe, expect, it } from "vitest";
import { canAccessDashboard, getDashboardOwnerEmail } from "./dashboard-access";

describe("dashboard access", () => {
  const originalOwnerEmail = process.env.NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL = originalOwnerEmail;
  });

  it("normalizes the dashboard owner email from env", () => {
    process.env.NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL = " Owner@Example.com ";

    expect(getDashboardOwnerEmail()).toBe("owner@example.com");
  });

  it("grants access only to the configured owner", () => {
    process.env.NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL = "owner@example.com";

    expect(
      canAccessDashboard({
        id: "1",
        username: "owner",
        email: "OWNER@example.com",
        full_name: "Owner User",
        role: "admin",
        status: "active",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(true);

    expect(
      canAccessDashboard({
        id: "2",
        username: "member",
        email: "member@example.com",
        full_name: "Member User",
        role: "member",
        status: "active",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
