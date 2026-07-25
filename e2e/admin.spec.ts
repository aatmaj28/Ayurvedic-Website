import { expect, test } from "@playwright/test";
import { ADMIN, login } from "./helpers";

test.describe("clinic admin", () => {
  test("admin can open the panel and see orders and appointments", async ({
    page,
  }) => {
    await login(page, ADMIN);

    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Clinic admin" })
    ).toBeVisible();

    await page.goto("/admin/orders");
    // Scope to the desktop <table> (the mobile card layout is display:none here).
    await expect(
      page.locator("table").getByText(/KC-\d{6}-\d{4}/).first()
    ).toBeVisible();

    await page.goto("/admin/appointments");
    await expect(
      page.getByRole("columnheader", { name: "Patient" })
    ).toBeVisible();
  });

  test("admin advances an order through the pipeline", async ({ page }) => {
    await login(page, ADMIN);
    await page.goto("/admin/orders");

    const row = page
      .getByRole("row")
      .filter({ hasText: "KC-260722-1937" });
    await expect(row).toBeVisible();

    const advance = row.getByRole("button", { name: /^→/ });
    if ((await advance.count()) > 0) {
      const target = (await advance.first().textContent())!
        .replace("→", "")
        .trim();
      await advance.first().click();
      await expect(row.getByText(target).first()).toBeVisible();
    }
  });
});
