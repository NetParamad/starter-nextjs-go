import { expect, test } from "@playwright/test";

test.describe("mobile navigation", () => {
  test("shows the bottom tab bar and fits public pages without overflow", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile-only assertions");

    await page.goto("/");

    const bottomNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(
      bottomNav.getByRole("link", { name: "Dashboard" }),
    ).toBeVisible();

    for (const path of ["/", "/login", "/signup", "/dashboard"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }

    await page.goto("/");
    await bottomNav.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await bottomNav.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
